import { Request, Response, NextFunction, Router } from "express";
import { createEmitAndSemanticDiagnosticsBuilderProgram } from "typescript";
// import { idText } from "typescript";
import { client } from "./database";
// import express from "express";

export let adminRoutes = Router();

// adminRoutes.use(checkIsAdmin, express.static("guard"));
// userRoutes.use(checkIsAdmin, express.static("guard"));

adminRoutes.get("/userInfo", async (req, res) => {
  let result = await client.query(
    `select 
        muas_id
      , username
      , profilepic
      from muas
      inner join users on users.id = muas_id `
  );
  let json = result.rows;
  res.json({ json });
});

adminRoutes.get("/adminProfile", async (req, res) => {
  let usersId = req.query.id;
  let result = await client.query(
    `
select 
* from reported        
        `
  );
  console.log("ID:" + usersId);
  let adminID = await client.query(
    `
select id, isAdmin from users where users.id = ${req.session.user?.id}   
    `
  );
  let isAdmin = adminID.rows[0];
  let admin = result.rows;
  //   let currentUser = req.session.user?.id;1
  res.json({ admin, isAdmin });
});

adminRoutes.get("/deletedPortfolio", async (req, res) => {
  let result = await client.query(`select * from deleted_portfolio`);
  let json = result.rows;
  res.json({ json });
  console.log(json);
});

export async function checkIsAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let checking = await client.query(
    `select id, isAdmin from users where users.id =${req.session.user?.id}`
  );
  let isAdmin = checking.rows[0];
  if (isAdmin.isadmin == true) {
    next();
  } else {
    res.json("你的帳號沒有權限進入");
  }
}

// export async function checkIsBanned(
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) {
//   let checking = await client.query(
//     `select muas_id from ban where muas_id = ${req.session.user?.id}`
//   );
//   let isBanned = checking.rows;
//   if (isBanned.length > 0) {
//     res.json("此帳號已被永久Banned");
//   } else {
//     next();
//   }
// }

adminRoutes.delete("/adminDelete", async (req, res) => {
  let mua_portfolio = req.body.insideImage;
  let mua_id = req.body.insideID;
  let mua_description = req.body.insideDescription;
  console.log(mua_description);
  console.log(mua_portfolio);
  await client.query(
    `delete from portfolio where mua_portfolio = '${mua_portfolio}'`
  );
  await client.query(
    `delete from reported where muas_image = '${mua_portfolio}'`
  );
  await client.query(
    `insert into deleted_portfolio (muas_id, muas_description, muas_image) values
    ('${mua_id}', '${mua_description}','${mua_portfolio}')`
  );
  res.json({});
});

adminRoutes.delete("/adminCancel", async (req, res) => {
  let mua_portfolio = req.body.insideImage;
  await client.query(
    `delete from reported where muas_image = '${mua_portfolio}'`
  );
  res.json({});
});

adminRoutes.delete("/adminRest", async (req, res) => {
  let mua_portfolio = req.body.insideImage;
  let mua_description = req.body.insideDescription;
  let mua_id = req.body.insideID;
  await client.query(
    `insert into portfolio (muas_id, mua_description, mua_portfolio) 
    values ('${mua_id}','${mua_description}','${mua_portfolio}')`
  );
  await client.query(
    `delete from deleted_portfolio where muas_image = '${mua_portfolio}'
    `
  );
  res.json({});
});

adminRoutes.delete("/adminPermanentDelete", async (req, res) => {
  let mua_portfolio = req.body.insideImage;
  await client.query(
    `delete from deleted_portfolio where muas_image = '${mua_portfolio}'
        `
  );
  res.json({});
});

adminRoutes.post("/adminBan", async (req, res) => {
  let mua_id = req.body.usersId;
  let mua_username = req.body.usersUsername;
  console.log(mua_id, mua_username);
  await client.query(
    `insert into ban (muas_id, muas_username) values ('${mua_id}', '${mua_username}')`
  );
  res.json({});
});
