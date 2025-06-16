import { io } from "socket.io-client";

let socket;

export const connectSocket = () => {
 if (!socket) {
    socket = io("https://snapvote1.onrender.com", {
      transports: ['websocket'], // prefer websocket only
      autoConnect: true,
       // if you're using cookies/auth
    });
  }
  return socket;
};

export const getSocket = () => socket;