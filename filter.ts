import { client } from "./database";
import { Router, RequestHandler, Request, Response } from "express";
import { markAsUntransferable } from "worker_threads";
import { muaRoutes } from "./Muas";

export const filterRoutes = Router();

filterRoutes.get("/filter", async (req, res) => {
  let result = await client.query("SELECT * from categories");
  let categories = result.rows;
  res.json(categories);
});

filterRoutes.get("/showMua", async (req, res) => {
  let result = await client.query(
    "SELECT username, users.id from muas join users on muas_id = users.id"
  );
  let muas = result.rows;
  // console.log("All the muas: ", muas);

  res.json(muas);
});

filterRoutes.post("/searchFilter", async (req, res) => {
  let params = req.body;
  // console.log("Params: ", params);
  
  if (params.length == 0) {
    res.json("Err: empty filter");
  } else {
    // console.log(params.join(' or '))
    let sql = `
  select username, users.id from offers join users on 
  muas_id = users.id
  where ${params.join(" or ")}
  order by users.id;
  `;
    let result = await client.query(sql);
    // console.log("Filtered muas: ", result.rows);
    let muas = new Set();
    let i = 0;
    let muasUnique = [];
    for (let mua of result.rows) {
      if (!muas.has(mua.username)) {
        muas.add(mua.username);
        muasUnique.push(mua);
      }
    }
    // console.log("Unique muas: ", muasUnique);

    res.json(muasUnique);
  }
});
