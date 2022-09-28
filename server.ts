import express, {
  Request,
  Response,
  NextFunction,
  Router,
  RequestHandler,
} from "express";
import { userRoutes } from "./user";
import { filterRoutes } from "./filter";
import { sessionMiddleware } from "./session";
import { env } from "./env";
import { print } from "listening-on";
import "./session";
import { profileRoutes } from "./profile";
import { muaRoutes } from "./Muas";
import http from "http";
import { Server as SocketIO } from "socket.io";
import { client } from "./database";
import { getChatroomRoutes } from "./chatroom";
import { adminRoutes, checkIsAdmin } from "./admin";

let app = express();
const server = http.createServer(app);
const io = new SocketIO(server);
app.use(express.static("public"));

//logger
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(cookieParser());
app.use(sessionMiddleware);
io.use((socket, next) => {
  let req = socket.request as Request;
  let res = req.res as Response;
  sessionMiddleware(req, res, next as NextFunction);
});

app.use(express.static("public"));

app.use("/uploads", express.static("uploads"));
app.use((req: express.Request, res, next) => {
  let user = req.session?.user;
  let name = user ? user.id + " " + user.username : "Guest";

  console.log(`${name} ${req.method} ${req.url}`);
  next();
});
app.get("/currentUser", (req, res) => {
  res.json(req.session?.user || false);
});

//use UserRoute for access user.ts
app.use(filterRoutes);
app.use(userRoutes);
app.use(profileRoutes);
app.use(muaRoutes);
app.use(adminRoutes);
app.use(getChatroomRoutes(io));
app.use(checkIsAdmin, express.static("guard"));

server.listen(env.PORT, () => {
  print(env.PORT);
});
