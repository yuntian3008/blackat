import * as Signal  from "@signalapp/libsignal-client";
import * as express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { connect } from "mongoose";
import User from "./db/model/User";
import Connection from "./socket/Connection";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../../shared/types/socket";
import AuthMiddleware from "./socket/middleware/AuthMiddleware";
import test, { testMode } from "./test";
import { ServerSocket } from "socket";

const app = express();
const httpServer = createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  maxHttpBufferSize: 15e6
});

io.use(AuthMiddleware)

export const clients: Map<string, ServerSocket> = new Map()
export const addClient = (e164: string, client: ServerSocket) => {
  clients.set(e164,client)
}

io.on("connection", (socket) => {
  Connection(socket)
  // console.log(clients.keys.toString())
  socket.on("disconnect", (reason) => {
    clients.delete(socket.data.phoneNumber)
    console.log(socket.data.phoneNumber + ' disconnected (' + reason + ')')
});
});

async function run() {
  
  await connect('mongodb+srv://blackat:Tpl.22062001@blackat.pnrmksc.mongodb.net/blackat')
  // console.log("[SYS] Connected to database")

  if (testMode) {
    await test()
    return
  }

  httpServer.listen(3000, () => {
    console.log('[SYS] Listen at 3000')
  });
}

run().catch(err => console.log("can't connect to database"))


