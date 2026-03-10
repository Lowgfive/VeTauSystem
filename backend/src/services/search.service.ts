import mongoose from "mongoose";
import { Station } from "../models/station.model";
import { Route } from "../models/route.model";
import { Schedule } from "../models/schedule.model";

// ═══════════════════════════════════════════════════
// IN-MEMORY CACHE (TTL = 10 phút)
// ═══════════════════════════════════════════════════
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class TTLCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private ttlMs: number;

  constructor(ttlMinutes: number) {
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key: string, data: T): void {
    this.store.set(key, { data, expiresAt: Date.now() + this.ttlMs });
  }
}

// route cache: key = "depId:arrId" → mảng station id path
const routeCache = new TTLCache<string[]>(10);

// search cache: key = "depId:arrId:date" → kết quả đã query
const searchCache = new TTLCache<TripResult>(10);

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════
interface RouteSegment {
  from: string;
  to: string;
}

interface TripResult {
  route: RouteSegment[];
  trains: object[];
}

interface SearchResult {
  departure: TripResult;
  return?: TripResult;
}

// ═══════════════════════════════════════════════════
// BFS — tìm đường ngắn nhất theo số ga
// Input : adjacency list Map<string, string[]>
// Output: mảng station ObjectId string (path) | null
// ═══════════════════════════════════════════════════
function bfs(
  graph: Map<string, string[]>,
  startId: string,
  endId: string
): string[] | null {
  const queue: string[][] = [[startId]];
  const visited = new Set<string>([startId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];

    if (current === endId) return path;

    for (const neighbor of graph.get(current) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  return null;
}

// ═══════════════════════════════════════════════════
// Build adjacency graph từ toàn bộ Route trong DB
// ═══════════════════════════════════════════════════
async function buildGraph(): Promise<Map<string, string[]>> {
  const allRoutes = await Route.find({}).select(
    "departure_station_id arrival_station_id"
  ).lean();

  const graph = new Map<string, string[]>();
  for (const r of allRoutes) {
    const from = (r.departure_station_id as mongoose.Types.ObjectId).toString();
    const to = (r.arrival_station_id as mongoose.Types.ObjectId).toString();
    if (!graph.has(from)) graph.set(from, []);
    graph.get(from)!.push(to);
  }

  return graph;
}

// ═══════════════════════════════════════════════════
// Resolve station names từ danh sách ObjectId string
// ═══════════════════════════════════════════════════
async function resolveStationNames(
  ids: string[]
): Promise<Map<string, string>> {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  const stations = await Station.find({ _id: { $in: objectIds } })
    .select("_id station_name")
    .lean();

  const map = new Map<string, string>();
  for (const s of stations) {
    map.set((s._id as mongoose.Types.ObjectId).toString(), s.station_name);
  }
  return map;
}

// ═══════════════════════════════════════════════════
// Tìm schedules cho một route path + date cụ thể
// ═══════════════════════════════════════════════════
async function findSchedulesForPath(
  pathIds: string[],
  date: string
): Promise<{ route: RouteSegment[]; trains: object[] }> {
  // 1. Build route segments với tên ga
  const nameMap = await resolveStationNames(pathIds);

  const route: RouteSegment[] = [];
  for (let i = 0; i < pathIds.length - 1; i++) {
    route.push({
      from: nameMap.get(pathIds[i]) ?? pathIds[i],
      to: nameMap.get(pathIds[i + 1]) ?? pathIds[i + 1],
    });
  }

  // 2. Tìm tất cả Route documents cho từng chặng
  const segmentQueries = pathIds.slice(0, -1).map((fromId, i) => ({
    departure_station_id: new mongoose.Types.ObjectId(fromId),
    arrival_station_id: new mongoose.Types.ObjectId(pathIds[i + 1]),
  }));

  const routeDocs = await Route.find({ $or: segmentQueries })
    .select("_id departure_station_id arrival_station_id")
    .lean();

  const routeIds = routeDocs.map((r) => r._id);

  // 3. Query Schedule theo route_id + date (không query trong loop)
  const searchDay = new Date(date);
  const dayStart = new Date(searchDay.setHours(0, 0, 0, 0));
  const dayEnd = new Date(searchDay.setHours(23, 59, 59, 999));

  const schedules = await Schedule.find({
    route_id: { $in: routeIds },
    date: { $gte: dayStart, $lte: dayEnd },
  })
    .populate("train_id", "train_name train_code")
    .lean();

  const trains = schedules.map((s) => ({
    train: s.train_id,
    departure_time: s.departure_time,
    arrival_time: s.arrival_time,
  }));

  return { route, trains };
}

// ═══════════════════════════════════════════════════
// MAIN FUNCTION
// ═══════════════════════════════════════════════════
export class SearchService {
  static async searchTrain(
    departureStation: string,
    arrivalStation: string,
    departureDate: string,
    returnDate?: string
  ): Promise<{ success: boolean; data?: SearchResult; message?: string }> {
    try {
      // ─── Bước 1: Tìm ga đi và ga đến ─────────────
      const [depStation, arrStation] = await Promise.all([
        Station.findOne({ station_name: departureStation }).lean(),
        Station.findOne({ station_name: arrivalStation }).lean(),
      ]);

      if (!depStation || !arrStation) {
        return { success: false, message: "Không tìm thấy ga" };
      }

      const depId = (depStation._id as mongoose.Types.ObjectId).toString();
      const arrId = (arrStation._id as mongoose.Types.ObjectId).toString();

      if (depId === arrId) {
        return {
          success: false,
          message: "Ga đi và ga đến không được trùng nhau",
        };
      }

      // ─── Check search cache (departure) ────────────
      const depSearchKey = `${depId}:${arrId}:${departureDate}`;
      const cachedDep = searchCache.get(depSearchKey);

      let departureResult: TripResult;

      if (cachedDep) {
        console.log("cache hit")
        departureResult = cachedDep;
      } else {
        // Cache MISS — check route cache
        const routeKey = `${depId}:${arrId}`;
        let pathIds = routeCache.get(routeKey);

        if (!pathIds) {
          // Route cache MISS — BFS
          const graph = await buildGraph();
          pathIds = bfs(graph, depId, arrId);

          if (!pathIds) {
            return {
              success: false,
              message: "Không có chuyến tàu nào!",
            };
          }

          // Save route cache
          routeCache.set(routeKey, pathIds);
        }

        // Query schedule
        departureResult = await findSchedulesForPath(pathIds, departureDate);

        // Save search cache
        searchCache.set(depSearchKey, departureResult);
      }

      // ─── Return trip (nếu có returnDate) ──────────
      let returnResult: TripResult | undefined;

      if (returnDate) {
        const retSearchKey = `${arrId}:${depId}:${returnDate}`;
        const cachedRet = searchCache.get(retSearchKey);

        if (cachedRet) {
          returnResult = cachedRet;
        } else {
          const retRouteKey = `${arrId}:${depId}`;
          let retPathIds = routeCache.get(retRouteKey);

          if (!retPathIds) {
            const graph = await buildGraph();
            retPathIds = bfs(graph, arrId, depId);

            if (retPathIds) {
              routeCache.set(retRouteKey, retPathIds);
            }
          }

          if (retPathIds) {
            returnResult = await findSchedulesForPath(retPathIds, returnDate);
            searchCache.set(retSearchKey, returnResult);
          }
        }
      }

      // ─── Bước 5: Trả kết quả ──────────────────────
      const result: SearchResult = { departure: departureResult };
      if (returnResult) result.return = returnResult;

      return { success: true, data: result };
    } catch (err) {
      console.error("[SearchService] Error:", err);
      return { success: false, message: "Lỗi hệ thống" };
    }
  }
}