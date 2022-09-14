import express from "express";
import { userRoutes } from "./user";
import { filterRoutes } from "./filter";
import { sessionMiddleware } from "./session";
import { client } from "./database";
import { env } from "./env";
import { print } from "listening-on";
import cookieParser from "cookie-parser";
import "./session";
import path from "path";
import { profileRoutes } from "./profile";


let app = express();
//logger
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(cookieParser());
app.use(sessionMiddleware);

app.use((req: express.Request, res, next) => {
  console.log(`${req.session.user?.username} ${req.method} ${req.url}`);
  next();
});

app.use(express.static("public"));


app.get("/currentUser", (req, res) => {
  res.json(req.session.user);
});


//use UserRoute for access user.ts
app.use(filterRoutes);
app.use(userRoutes);
app.use(profileRoutes);

app.listen(env.PORT, () => {
  print(env.PORT);
});
