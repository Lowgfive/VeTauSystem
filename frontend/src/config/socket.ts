import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        // Không ép chỉ websocket: một số môi trường/firewall chặn upgrade → dùng polling trước rồi nâng cấp (mặc định của engine.io)
        socket = io(SOCKET_URL, {
            autoConnect: false,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
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

// Join a train room to receive realtime seat updates across overlapping segments
export const joinTrainRoom = (trainId: string): void => {
    getSocket().emit("join-train", trainId);
};

export const leaveTrainRoom = (trainId: string): void => {
    getSocket().emit("leave-train", trainId);
};
