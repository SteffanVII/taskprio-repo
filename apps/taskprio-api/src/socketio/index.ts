import { Server } from "socket.io";
import http from "http"
import { onSocketIOConnect } from "./handlers.js";

export let io : Server;

export const initializeSocketIO = async (httpServer : http.Server, callback?: (io: Server) => void) => {

  io = new Server(httpServer)
  console.log("Socket.IO server initialized ✅")
  callback?.(io)

  io.on("connect", onSocketIOConnect)

}