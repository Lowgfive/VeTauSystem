import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            autoConnect: false,
            transports: ["websocket"],
        });
    }
    return socket;
};

export const connectSocket = (): void => {
    const s = getSocket();
    if (!s.connected) s.connect();
};

export const disconnectSocket = (): void => {
    if (socket?.connected) socket.disconnect();
};

// Join a schedule room to receive realtime seat updates
export const joinScheduleRoom = (scheduleId: string): void => {
    getSocket().emit("join-schedule", scheduleId);
};

export const leaveScheduleRoom = (scheduleId: string): void => {
    getSocket().emit("leave-schedule", scheduleId);
};
