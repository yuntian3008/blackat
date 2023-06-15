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
import { Signal } from "../../shared/types";
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
export const addClient = (address: Signal.Types.SignalProtocolAddress, client: ServerSocket) => {
  clients.set(JSON.stringify(address),client)
}

io.on("connection", (socket) => {
  Connection(socket)
  // console.log(clients.keys.toString())
  socket.on("disconnect", (reason) => {
    clients.delete(JSON.stringify({
      e164: socket.data.logged.e164,
      deviceId: socket.data.logged.deviceId
    }))
    console.log(socket.data.phoneNumber + ' disconnected (' + reason + ')')
});
});

async function run() {
  
  await connect('mongodb+srv://blackat:Tpl.22062001@blackat.pnrmksc.mongodb.net/blackat')
  console.log("[SYS] Connected to MONGODB")

  if (testMode) {
    await test()
    return
  }

  httpServer.listen(3000, () => {
    console.log('[SYS] Listen at ' + 3000)
  });
}

run().catch((err) => {
  console.log("can't connect to database") 
  console.log(err)
})


