import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "1d") as SignOptions["expiresIn"];

if (!JWT_SECRET) {
  console.warn("[JWT] Missing JWT_SECRET in environment variables");
}

export interface AuthTokenPayload extends JwtPayload {
  userId: string;
  role?: string;
}

export const signAccessToken = (payload: AuthTokenPayload) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(payload as object, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyAccessToken = (token: string): AuthTokenPayload => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
};


