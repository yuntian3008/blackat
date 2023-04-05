import * as Signal  from "@signalapp/libsignal-client";
import * as express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { connect } from "mongoose";
import User from "./db/model/User";
import Connection from "./socket/Connection";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../../shared/types/socket";
import AuthMiddleware from "./socket/middleware/AuthMiddleware";

const app = express();
const httpServer = createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer);

io.use(AuthMiddleware)

io.on("connection", Connection);

async function run() {
  await connect('mongodb://localhost:27017/blackat')
  console.log("[SYS] Connected to database")

  httpServer.listen(3000, () => {
    console.log('[SYS] Listen at 3000')
  });
}

run().catch(err => console.log("can't connect to database"))


