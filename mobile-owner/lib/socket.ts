import { io, type Socket } from "socket.io-client";
import { API_URL } from "./config";

let socket: Socket | null = null;

// Lazily create a single shared connection (autoConnect: false — we drive
// connect/disconnect explicitly from the root layout based on auth state,
// matching the backend's room-based routing: the server only knows where to
// send "newOrder" once this socket has emitted "identity" with the owner's
// own user id, per backend/socket.js.
export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_URL, { transports: ["websocket"], autoConnect: false });
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
}
