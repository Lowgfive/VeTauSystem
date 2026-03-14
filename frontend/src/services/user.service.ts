import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

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
