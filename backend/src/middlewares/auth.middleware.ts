import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { UserRole } from "../types/auth.type";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role?: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);

    req.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch (err) {
    console.error("[AUTH]", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== UserRole.ADMIN) {
    return res.status(403).json({ success: false, message: "Yêu cầu quyền quản trị viên" });
  }
  next();
};


