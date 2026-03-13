import { Train } from "../models/train.model";
import { Carriage } from "../models/carriage.model";
import { Seat } from "../models/seat.model";
import { TrainTemplate, CarriageTemplate as DBCarriageTemplate } from "../models";
import { ITrain, TrainType } from "../types/train.type";
import { SeatType, CarriageLayout } from "../types/carriage.type";

// ─── Cấu hình mặc định (Fallback) ──────────────────────────
interface CarriageTemplate {
    seat_type: SeatType;
    count: number;
    seats_per_carriage: number;
    standing_capacity: number;
    layout: CarriageLayout;
    priority_seats: number;
}

const METRO_4CAR_TEMPLATE: CarriageTemplate[] = [
    { seat_type: "seat", count: 4, seats_per_carriage: 44, standing_capacity: 200, layout: { rows: 11, cols: 4 }, priority_seats: 8 },
];

const METRO_6CAR_TEMPLATE: CarriageTemplate[] = [
    { seat_type: "seat", count: 6, seats_per_carriage: 44, standing_capacity: 200, layout: { rows: 11, cols: 4 }, priority_seats: 8 },
];

const METRO_8CAR_TEMPLATE: CarriageTemplate[] = [
    { seat_type: "seat", count: 8, seats_per_carriage: 44, standing_capacity: 200, layout: { rows: 11, cols: 4 }, priority_seats: 8 },
];

const TEMPLATE_MAP: Record<TrainType, CarriageTemplate[]> = {
    "4-car": METRO_4CAR_TEMPLATE,
    "6-car": METRO_6CAR_TEMPLATE,
    "8-car": METRO_8CAR_TEMPLATE,
};

interface CreateTrainInput {
    train_name: string;
    train_code: string;
    train_type?: TrainType;
    line_id: string;
    template_id?: string; // Thêm template_id từ DB
    amenities?: string[];
}

export const createTrain = async (input: CreateTrainInput) => {
    let templates: CarriageTemplate[] = [];

    if (input.template_id) {
        // Lấy template từ Database
        const dbTemplate = await TrainTemplate.findById(input.template_id).populate("carriage_templates");
        if (!dbTemplate) throw new Error("Không tìm thấy mẫu tàu trong hệ thống");

        // Gom nhóm các toa cùng loại để dùng chung logic generate
        const carriageTemplates = dbTemplate.carriage_templates as any[];
        const counts: Record<string, number> = {};
        const uniqueTemplates: any[] = [];

        carriageTemplates.forEach(t => {
            if (!counts[t._id.toString()]) {
                counts[t._id.toString()] = 1;
                uniqueTemplates.push(t);
            } else {
                counts[t._id.toString()]++;
            }
        });

        templates = uniqueTemplates.map(t => ({
            seat_type: t.seat_type,
            count: counts[t._id.toString()],
            seats_per_carriage: t.total_seats,
            standing_capacity: t.standing_capacity,
            layout: t.layout,
            priority_seats: t.seat_type === "priority" ? t.total_seats : (t.seat_type === "seat" ? 8 : 0)
        }));
    } else {
        const trainType: TrainType = input.train_type || "4-car";
        templates = TEMPLATE_MAP[trainType];
    }

    // Tính tổng số toa và sức chứa
    const totalCarriages = templates.reduce((sum, t) => sum + t.count, 0);
    const totalCapacity = templates.reduce(
        (sum, t) => sum + t.count * (t.seats_per_carriage + t.standing_capacity),
        0
    );

    // ── Bước 1: Tạo document Train ──────────────────────────────────────────
    const train = await Train.create({
        train_name: input.train_name,
        train_code: input.train_code,
        train_type: input.train_type || "manual",
        line_id: input.line_id,
        template_id: input.template_id,
        total_carriages: totalCarriages,
        capacity: totalCapacity,
        max_speed: 120,
        amenities: input.amenities || ["air-conditioning", "wifi"],
    });

    // ── Bước 2: Auto-generate các toa và ghế ────────────────────────────────
    await generateCarriagesAndSeats(train._id.toString(), templates);

    // ── Bước 3: Trả về tàu kèm danh sách toa đã tạo ───────────────────────
    const carriages = await Carriage.find({ train_id: train._id }).sort({ carriage_number: 1 });
    return { train, carriages };
};

// Logic cốt lõi: khi tạo đoàn tàu, tự động sinh ra toa xe + ghế ngồi
const generateCarriagesAndSeats = async (
    trainId: string,
    templates: CarriageTemplate[]
) => {
    let carriageNumber = 1;

    for (const template of templates) {
        for (let i = 0; i < template.count; i++) {
            // ── Tạo document Carriage ─────────────────────────────────────────
            const carriage = await Carriage.create({
                train_id: trainId,
                carriage_number: carriageNumber,
                seat_type: template.seat_type,
                total_seats: template.seats_per_carriage,
                standing_capacity: template.standing_capacity,
                layout: template.layout,
            });

            // ── Tạo tất cả ghế cho toa này ───────────────────────────────────
            await generateSeatsForCarriage(
                carriage._id.toString(),
                carriageNumber,
                template
            );

            carriageNumber++;
        }
    }
};

const generateSeatsForCarriage = async (
    carriageId: string,
    carriageNumber: number,
    template: CarriageTemplate
) => {
    const { rows, cols } = template.layout;
    const priorityRows = Math.ceil(template.priority_seats / cols);
    const seats = [];

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const colLetter = String.fromCharCode(65 + col);
            const seatNumber = `${carriageNumber}${colLetter}${row + 1}`;

            const seatType: SeatType = row < priorityRows ? "priority" : template.seat_type;

            seats.push({
                carriage_id: carriageId,
                seat_number: seatNumber,
                seat_type: seatType,
                status: "available",
                position: { row, col },
            });
        }
    }

    await Seat.insertMany(seats);
};

export const getAllTrains = async () => {
    return Train.find({ is_active: true })
        .populate("line_id", "line_name line_code")
        .sort({ train_code: 1 });
};

export const getTrainById = async (trainId: string) => {
    const train = await Train.findById(trainId).populate("line_id", "line_name line_code");
    if (!train) return null;

    const carriages = await Carriage.find({ train_id: trainId }).sort({
        carriage_number: 1,
    });

    return { train, carriages };
};

interface UpdateTrainInput {
    train_name?: string;
    train_type?: TrainType;
    amenities?: string[];
    is_active?: boolean;
    max_speed?: number;
}

export const updateTrain = async (trainId: string, data: UpdateTrainInput) => {
    return Train.findByIdAndUpdate(trainId, data, { new: true });
};

export const deleteTrain = async (trainId: string) => {
    // Soft delete tàu
    await Train.findByIdAndUpdate(trainId, { is_active: false });

    // Cũng soft delete tất cả toa của tàu này
    await Carriage.updateMany({ train_id: trainId }, { is_active: false });

    return { message: "Đã xóa đoàn tàu metro và các toa liên quan" };
};

export const getSeatsByCarriage = async (carriageId: string) => {
    return Seat.find({ carriage_id: carriageId }).sort({
        "position.row": 1,
        "position.col": 1,
    });
};

export const getSeatsByTrain = async (trainId: string) => {
    const carriages = await Carriage.find({ train_id: trainId, is_active: true });
    const carriageIds = carriages.map((c) => c._id);

    const seats = await Seat.find({ carriage_id: { $in: carriageIds } }).sort({
        "position.row": 1,
        "position.col": 1,
    });

    // Nhóm ghế theo từng toa để frontend dễ render SeatMap
    const seatsByCarriage: Record<string, typeof seats> = {};
    carriages.forEach((c) => {
        seatsByCarriage[c._id.toString()] = seats.filter(
            (s) => s.carriage_id.toString() === c._id.toString()
        );
    });

    return { carriages, seatsByCarriage };
};
