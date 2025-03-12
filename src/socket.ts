import { io, Socket } from "socket.io-client";

const socket: Socket = io(import.meta.env.VITE_API_URL, {
  autoConnect: false,
  withCredentials: true,
  path: import.meta.env.VITE_SOCKET_PATH,
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
});

socket.on("connect", () => {
  console.log("Socket connected to:", import.meta.env.VITE_API_URL);
  console.log("Socket path:", import.meta.env.VITE_SOCKET_PATH);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error.message);
  console.log("Connection URL:", import.meta.env.VITE_API_URL);
  console.log("Socket path:", import.meta.env.VITE_SOCKET_PATH);
});

export default socket;
//   GNU nano 6.2                          .env
// VITE_API_URL=https://oyan-store.kz
// VITE_SOCKET_PATH=/socket.io/
