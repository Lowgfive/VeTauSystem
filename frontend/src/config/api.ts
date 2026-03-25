import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    // authSlice.ts saves the token directly to localStorage under the key "token"
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized errors
        if (error.response && error.response.status === 401) {
            console.warn("[API] Unauthorized access - clearing session and redirecting to login");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            
            // Redirect to login if not already there
            if (!window.location.pathname.startsWith("/login")) {
                window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
            }
        }
        
        return Promise.reject(error);
    }
);
