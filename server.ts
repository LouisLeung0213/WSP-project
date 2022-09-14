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

// app.get("/searchFilter", (req,res) => {
//   let cat_id = req.query.cat_id
//   let cat_ids = Array.isArray(cat_id) ? cat_id : cat_id ? [cat_id] : []
//   console.log(cat_ids)
//   res.json(cat_ids); 
// })
app.post("/searchFilter", async (req,res) => {
  let params = req.body
  console.log(params.join(' or '))
  let sql = `
  select users.id, username, categories_id from offers join users on 
  muas_id = users.id
  where ${params.join(' or ')};
  ` 

  let result = await client.query(sql)
  console.log(result.rows);
  
  res.json(sql); 
})

app.get("/currentUser", (req, res) => {
  res.json(req.session.user);
});


//use UserRoute for access user.ts
app.use(userRoutes);

app.listen(env.PORT, () => {
  print(env.PORT);
});
