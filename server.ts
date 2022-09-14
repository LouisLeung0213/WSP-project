import express from "express";
import { userRoutes } from "./user";
import { sessionMiddleware } from "./session";
import { client } from "./database";
import { env } from "./env";
import { print } from "listening-on";
import cookieParser from "cookie-parser";
import "./session";
import path from "path";

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

app.get("/filter", async (req, res) => {
  let result = await client.query("SELECT * from categories");
  let categories = result.rows;
  res.json(categories);
});

app.get("/currentUser", (req, res) => {
  res.json(req.session.user);
});
app.get("/searchFilter", (req, res) => {
  let cat_id = req.query.cat_id;
  res.end(console.log(cat_id));
});

//use UserRoute for access user.ts
app.use(userRoutes);

app.listen(env.PORT, () => {
  print(env.PORT);
});
