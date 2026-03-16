import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

const getStoredUser = () => {
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    try {
        const user = JSON.parse(stored);
        if (user && user._id && !user.id) {
            user.id = user._id;
        }
        return user;
    } catch (e) {
        return null;
    }
};

const initialState: AuthState = {
    user: getStoredUser(),
    token: localStorage.getItem("token"),
    isAuthenticated: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess(state, action: PayloadAction<{ user: User & { _id?: string }; token: string }>) {
            const user = { ...action.payload.user };
            if (user._id && !user.id) {
                user.id = user._id;
            }
            state.user = user as User;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            localStorage.setItem("token", action.payload.token);
            localStorage.setItem("user", JSON.stringify(user));
        },
        logout(state) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        },
    },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
