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

filterRoutes.post("/showMua", async (req, res) => {
  let currentPage = req.body.currentPage;
  let showMuaQty = 5;
  console.log("countPage: ", currentPage);

  let today = new Date();
  await client.query(
    `update muas set is_new = false where $1 - join_date > 7`,
    [today]
  );

  let sql = `SELECT username, users.id, users.nickname, users.profilepic, muas.avg_score, json_agg(mua_portfolio) as mua_portfolio, muas.is_new, muas.comment_qty_enough
  from muas join users on muas_id = users.id 
    left join portfolio on portfolio.muas_id= users.id group by users.id, muas.muas_id
    order by muas.is_new, muas.comment_qty_enough, avg_score desc
    offset $1 limit $2;`;
  let result = await client.query(sql, [
    showMuaQty * (currentPage - 1),
    showMuaQty,
  ]);
  
  let muas = result.rows;
  // console.log("All the muas: ", muas);

  let maxPageResult = await client.query(
    `select count(muas_id) as muasQty from muas;`
  );

  let maxPage = Math.ceil((+maxPageResult.rows[0].muasqty)/showMuaQty);
  console.log("maxPage: ", maxPage);

  res.json({ muas, maxPage });
});

filterRoutes.post("/searchFilter", async (req, res) => {
  let filterOptions = req.body;
  let currentPage = req.body.currentPage
  let showMuaQty = 5;

  console.log("currentPage: ",currentPage);
  

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
, muas.comment_qty_enough
from muas
inner join users on users.id = muas.muas_id
left join portfolio on portfolio.muas_id = muas.muas_id
where muas.muas_id in (select muas_id from whitelist)
  and muas.muas_id not in (select muas_id from blacklist) 
group by muas.muas_id, users.id
order by muas.is_new, muas.comment_qty_enough, avg_score desc
offset $3 limit $4;`;

    let result = await client.query(sql, [
      filterOptions.dates,
      filterOptions.cats,
      showMuaQty * (currentPage - 1),
      showMuaQty,
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

    let sqlAll = `
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
, muas.comment_qty_enough
from muas
inner join users on users.id = muas.muas_id
left join portfolio on portfolio.muas_id = muas.muas_id
where muas.muas_id in (select muas_id from whitelist)
  and muas.muas_id not in (select muas_id from blacklist) 
group by muas.muas_id, users.id
order by muas.is_new, muas.comment_qty_enough, avg_score desc;`
    
  let maxPageResult = await client.query(sqlAll, [
    filterOptions.dates,
    filterOptions.cats
  ])
    
  let maxPage = Math.ceil((maxPageResult.rows.length)/showMuaQty);
  console.log(`Total muas qty: ${maxPageResult.rows.length}, so the max page is ${maxPage}`);

    res.json({muasUnique, maxPage});
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

filterRoutes.get("/selectedDatesMua", async (req, res) => {
  let pageId = req.query.id;

  let sql = `SELECT to_char(unavailable_date, 'yyyy/mm/dd') as date from date_matches where muas_id = $1`;
  let result = await client.query(sql, [pageId]);
  let unavailable_dates = result.rows;
  res.json(unavailable_dates);
});

filterRoutes.get("/checkIsAdmin", async (req, res) => {
  if (req.session.user) {
    let adminID = await client.query(
      `
select id, isAdmin from users where users.id = ${req.session.user!.id}   
    `
    );
    let isAdmin = adminID.rows[0];
    res.json({ isAdmin });
  } else {
    res.json({});
  }
});
