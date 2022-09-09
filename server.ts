import express from "express";
import { userRoutes } from "./user";
import { sessionMiddleware } from "./session";
import { client } from "./database";
import { env } from "./env";
import { print } from "listening-on";

let app = express();
//logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(sessionMiddleware);

//use UserRoute for access user.ts
app.use(userRoutes);

app.listen(env.PORT, () => {
  print(env.PORT);
});
