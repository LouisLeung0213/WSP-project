import { Router, Request, Response } from "express";
import formidable from "formidable";
import { client } from "./database";
import "./session";

export const muaRoutes = Router();

muaRoutes.post("/registration", async (req, res) => {
  // console.log(req.session.user!.id);
  let result = await client.query(`select * from users where id = ($1)`, [
    req.session.user!.id,
  ]);
  let userInfo = result.rows[0];
  // console.log(userInfo);
  await client.query(`insert into muas (muas_id) values ($1)`, [
    req.session.user!.id,
  ]);
  console.log(userInfo);
  if (userInfo.profilepic) {
    let result = await client.query(`insert into muas (icon) value ($1)`, [
      userInfo.profilepic,
    ]);
  }

  res.json({});
});
//TODO
muaRoutes.get("/isMua", async (req, res) => {
  let result = await client.query(`select * from muas where id = ($1)`, [
    req.session.user!.id,
  ]);
  if (result.rows.length > 0) {
    res.status(200);
    res.json({});
  }
  res.json({});
});
