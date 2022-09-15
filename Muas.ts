import { Router, Request, Response } from "express";
import formidable from "formidable";
import { client } from "./database";
import "./session";

export const muaRoutes = Router();

muaRoutes.post("/registration", async (req, res) => {
  try {
    console.log("current id" + req.session.user!.id);
    let result = await client.query(`select * from users where id = $1`, [
      req.session.user!.id,
    ]);
    let userInfo = result.rows[0];
    // console.log(userInfo);
    await client.query(`insert into muas (muas_id) values ($1)`, [
      req.session.user!.id,
    ]);
    if (userInfo.profilepic) {
      await client.query(`update muas set icon = ($1) where muas_id = ($2)`, [
        userInfo.profilepic,
        req.session.user!.id,
      ]);
    }

    res.json({});
    return;
  } catch (error) {
    res.status(500);
    res.json({});
  }
});
//TODO
muaRoutes.get("/isMua", async (req, res) => {
  try {
    let result = await client.query(`select * from muas where muas_id = $1`, [
      req.session.user!.id,
    ]);
    console.log(result.rows[0]);
    if (result.rows.length > 0) {
      res.status(200);
      res.json({ id: req.session.user!.id, pic: result.rows[0].icon });
      return;
    }
  } catch (error) {
    res.status(401);
    res.json({});
  }
});
