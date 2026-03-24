import axios from "axios";

// Access the API URL defined in frontend/.env
const API_URL = (import.meta as any).env.VITE_API_URL || "http://localhost:4000";

const api = axios.create({
    baseURL: `${API_URL}/api/v1`,
    headers: {
        "Content-Type": "application/json",
    },
});

export const authService = {
    register: async (data: any) => {
        try {
            // Data expected by backend schema: name, email, password
            const response = await api.post("/auth/register", data);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || "Lỗi đăng ký");
            }
            throw new Error("Không thể kết nối đến server. Vui lòng thử lại sau.");
        }
    },
    googleLogin: async (token: string) => {
        try {
            const response = await api.post("/auth/google", { token });
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || "Lỗi đăng nhập Google");
            }
            throw new Error("Không thể kết nối đến server. Vui lòng thử lại sau.");
        }
    },
};
