import { client } from "./database";
import { Router, RequestHandler, Request, Response } from "express";
import { markAsUntransferable } from "worker_threads";
import { muaRoutes } from "./muas";

export const filterRoutes = Router();

filterRoutes.get("/filter", async (req, res) => {
  let result = await client.query("SELECT * from categories");
  let categories = result.rows;
  res.json(categories);
});

filterRoutes.get("/showMua", async (req, res) => {
  let sql = `SELECT username, users.id, users.nickname, muas.icon, muas.avg_score, mua_portfolio 
  from muas join users on muas_id = users.id 
    left join portfolio on portfolio.muas_id= users.id`;
  let result = await client.query(sql);
  let muas = result.rows;
  // console.log("All the muas: ", muas);

  res.json(muas);
});

filterRoutes.post("/searchFilter", async (req, res) => {
  let filterOptions = req.body;
  // console.log("Params: ", params);

  if (filterOptions.cats.length == 0 && filterOptions.dates.length == 0) {
    res.json("Err: empty filter");
  } else {
    let andExs = " ";
    let dateExsStart = "";
    let dateExsEnd = "";
    if (filterOptions.cats.length !== 0 && filterOptions.dates.length !== 0) {
      andExs = ") and (";
    }
    if (filterOptions.dates.length !== 0) {
      dateExsStart =
        " offers.muas_id not in (select muas_id from date_matches where ";
      dateExsEnd = ")";
    }
    console.log(filterOptions);
    let sql = `
  select username, users.id from offers 
  join users on muas_id = users.id 
  left join date_matches on date_matches.muas_id = users.id
  where (${filterOptions.cats.join(" or ")}
  ${andExs}${dateExsStart}${filterOptions.dates.join(" or ")}${dateExsEnd}) 
  order by users.id;
  `;
    console.log("sql: ", sql);

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
