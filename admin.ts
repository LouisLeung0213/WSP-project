import { Router } from "express";
import { idText } from "typescript";
import { client } from "./database";

export let adminRoutes = Router();

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
select id, isAdmin from users where users.id = ${req.session.user!.id}   
    `
  );
  let isAdmin = adminID.rows[0];
  let admin = result.rows;
  //   let currentUser = req.session.user?.id;
  res.json({ admin, isAdmin });
});

adminRoutes.delete("/adminDelete", async (req, res) => {
  let mua_portfolio = req.body.insideImage;
  console.log(mua_portfolio);
  await client.query(
    `delete from portfolio where mua_portfolio = '${mua_portfolio}'`
  );
  await client.query(
    `delete from reported where muas_image = '${mua_portfolio}'`
  );

  res.json({});
});
