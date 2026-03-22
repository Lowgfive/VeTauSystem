// ─── Auth Request/Response Types ─────────────────────────────────────────────

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

// User info returned to client (no password)
export interface UserResponse {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export interface LoginResponse {
    token: string;
    user: UserResponse;
}

export interface RegisterResponse {
    message: string;
}

// ─── Enum ─────────────────────────────────────────────────────────────────────

export enum UserRole {
    USER = "user",
    ADMIN = "admin",
}
