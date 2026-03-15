import { apiClient } from "../config/api";

// Interceptor to attach the token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token"); // Hoặc lấy từ Redux/Zustand tuỳ dự án
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getProfile = async () => {
    const response = await apiClient.get("/users/profile");
    return response.data;
};

export interface UpdateProfileInput {
    name?: string;
    phone?: string;
    cccd?: string;
}

export const updateProfile = async (data: UpdateProfileInput) => {
    const response = await apiClient.put("/users/profile", data);
    return response.data;
};
