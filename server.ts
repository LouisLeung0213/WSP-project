import express from "express";
import http from "http";
import { Server as SocketIO } from "socket.io";
import dotenv from "dotenv";
import { env } from "./env";
import { print } from "listening-on";
dotenv.config();

let app = express();
const server = new http.Server(app);
const io = new SocketIO(server);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

// TODO Login
// TODO Signup
// TODO Logout
// TODO Profile

server.listen(env.PORT, () => {
  print(env.PORT);
});
