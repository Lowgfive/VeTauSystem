import { IRoute } from "../types/route.type";

export const BASE_RATE_VND_PER_KM = 1000;

export const getSeatTypeMultiplier = (seatType: string): number => {
  switch (seatType) {
    case "hard_seat":
      return 0.8;
    case "soft_seat":
      return 1.0;
    case "sleeper_6":
      return 1.5;
    case "sleeper_4":
      return 1.8;
    case "vip_sleeper_2":
      return 2.5;
    default:
      return 1.0;
  }
};

export const calculateTotalRouteDistance = (
  routes: Array<Pick<IRoute, "distance">>
): number => {
  return routes.reduce((total, route) => total + (route.distance || 0), 0);
};

export const calculateBaseRoutePrice = (
  routes: Array<Pick<IRoute, "distance" | "base_price">>
): number => {
  const hasExplicitBasePrice = routes.every((route) => route.base_price != null);

  if (hasExplicitBasePrice) {
    return Math.round(
      routes.reduce((total, route) => total + (route.base_price || 0), 0)
    );
  }

  return Math.round(calculateTotalRouteDistance(routes) * BASE_RATE_VND_PER_KM);
};
