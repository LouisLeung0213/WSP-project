import { client } from "./database";
import { Router, RequestHandler, Request, Response } from "express";
import { markAsUntransferable } from "worker_threads";
import { muaRoutes } from "./Muas";

export const filterRoutes = Router();

filterRoutes.get("/filter", async (req, res) => {
  let resultAllCats = await client.query("SELECT * from categories");
  let muaId = req.query.id;
  let resultMuaCats;
  let muaCats = [];
  if (muaId) {
    resultMuaCats = await client.query(
      `SELECT categories_id from offers where muas_id = ${muaId}`
    );
    for (let resultMuaCat of resultMuaCats.rows) {
      muaCats.push(resultMuaCat.categories_id);
    }
  }
  let currentUser = req.session.user?.id;
  let categories = {
    allCats: resultAllCats.rows,
    muaCats,
    currentUser,
  };
  res.json(categories);
});

filterRoutes.get("/showMua", async (req, res) => {
  let today = new Date()
  await client.query(`update muas set is_new = false where $1 - join_date > 7`,[today])

  let sql = `SELECT username, users.id, users.nickname, users.profilepic, muas.avg_score, json_agg(mua_portfolio) as mua_portfolio, muas.is_new
  from muas join users on muas_id = users.id 
    left join portfolio on portfolio.muas_id= users.id group by users.id, muas.muas_id
    order by muas.is_new, avg_score desc;`;
  let result = await client.query(sql);
  let muas = result.rows;
  // console.log("All the muas: ", muas);

  res.json(muas);
});

filterRoutes.post("/searchFilter", async (req, res) => {
  let filterOptions = req.body;
  // console.log("req.", req.body);
  if (filterOptions.cats.length == 0 && filterOptions.dates.length == 0) {
    res.json("Err: empty filter");
  } else {
    let sql = `
    with
  blacklist as (
  select
    distinct date_matches.muas_id
  from date_matches
  where date_matches.unavailable_date = any($1)
)
, whitelist as (
  select
    distinct offers.muas_id
  from offers
  where offers.categories_id = all($2::int[])
)

select
  muas.muas_id as mua_id
, muas.avg_score
, users.profilepic
, users.nickname
, array_agg(portfolio.mua_portfolio) as mua_portfolio
, muas.is_new
from muas
inner join users on users.id = muas.muas_id
left join portfolio on portfolio.muas_id = muas.muas_id
where muas.muas_id in (select muas_id from whitelist)
  and muas.muas_id not in (select muas_id from blacklist) 
group by muas.muas_id, users.id
order by muas.is_new, avg_score desc`;

    let result = await client.query(sql, [
      filterOptions.dates,
      filterOptions.cats,
    ]);
    // console.log("Filtered muas: ", result.rows);
    let muas = new Set();
    let i = 0;
    let muasUnique = [];
    for (let mua of result.rows) {
      if (!muas.has(mua.mua_id)) {
        muas.add(mua.mua_id);
        muasUnique.push(mua);
      }
    }
    // console.log("Unique muas: ", muasUnique);

    res.json(muasUnique);
  }
});

filterRoutes.post("/saveCat", async (req, res) => {
  let tags = req.body;
  // console.log(tags);
  let sessionId = req.session.user?.id;
  // console.log(sessionId);

  if (tags.cats.length == 0) {
    res.json("Err: empty filter");
  } else {
    await client.query(
      `
    DELETE FROM offers WHERE muas_id = $1
  `,
      [sessionId]
    );
    await client.query(
      `
    DELETE FROM date_matches WHERE muas_id = $1`,
      [sessionId]
    );

    for (let catId of tags.cats) {
      await client.query(
        `insert into offers (muas_id, categories_id) values ($1, $2)`,
        [sessionId, catId]
      );
    }

    for (let unavailableDate of tags.dates) {
      await client.query(
        `insert into date_matches (muas_id, unavailable_date) values ($1, $2)`,
        [sessionId, unavailableDate]
      );
    }

    res.json("Save categories and dates successfully!");
  }
});

filterRoutes.get("/showAvailableDate", async (req, res) => {
  let pageId = req.query.id;

  let sql = `SELECT to_char(unavailable_date, 'yyyy/mm/dd') as date from date_matches where muas_id = $1`;
  let result = await client.query(sql, [pageId]);
  let unavailable_dates = result.rows;
  res.json(unavailable_dates);
});

filterRoutes.get("/selectedDatesMua", async (req, res) => {
  let pageId = req.query.id;

  let sql = `SELECT to_char(unavailable_date, 'yyyy/mm/dd') as date from date_matches where muas_id = $1`;
  let result = await client.query(sql, [pageId]);
  let unavailable_dates = result.rows;
  res.json(unavailable_dates);
});
