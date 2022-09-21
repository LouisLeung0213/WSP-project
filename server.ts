import express, { Request, Response, NextFunction, Router } from "express";
import { userRoutes } from "./user";
import { filterRoutes } from "./filter";
import { sessionMiddleware } from "./session";
import { env } from "./env";
import { print } from "listening-on";
import "./session";
import { profileRoutes } from "./profile";
import { muaRoutes } from "./Muas";
import { adminRoutes } from "./admin";
import http from "http";
import { Server as SocketIO } from "socket.io";
import { client } from "./database";
import { getChatroomRoutes } from "./chatroom";

let app = express();
const server = http.createServer(app);
const io = new SocketIO(server);
app.use(express.static("public"));

//logger
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(cookieParser());
app.use(sessionMiddleware);

app.use((req: express.Request, res, next) => {
  console.log(`${req.session.user?.username} ${req.method} ${req.url}`);
  next();
});

app.use("/uploads", express.static("uploads"));
app.get("/currentUser", (req, res) => {
  res.json(req.session.user);
});

//use UserRoute for access user.ts
app.use(filterRoutes);
app.use(userRoutes);
app.use(profileRoutes);
app.use(muaRoutes);
app.use(adminRoutes);
app.use(getChatroomRoutes(io));

server.listen(env.PORT, () => {
  print(env.PORT);
});
