import { io } from "socket.io-client";

let socket;

export const connectSocket = () => {
  if (!socket) {
    socket = io("http://localhost:4000", {
      transports: ['websocket'], // force WS, no polling fallback
      autoConnect: true,
    });
  }
  return socket;
};

export const getSocket = () => socket;