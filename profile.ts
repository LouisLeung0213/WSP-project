// import { profile } from "console";
import { response, Router } from "express";
import formidable from "formidable";
import fs from "fs";
// import { resourceLimits } from "worker_threads";
import { client } from "./database";
import "./session";

export let profileRoutes = Router();

const uploadDir = "./public/uploads";
fs.mkdirSync(uploadDir, { recursive: true });

const form = formidable({
  uploadDir,
  keepExtensions: true,
  maxFiles: 1,
  maxFileSize: 200 * 1024 ** 2, // the default limit is 200KB
  filter: (part) => part.mimetype?.startsWith("image/") || false,
});

profileRoutes.post("/addWork", (req, res) => {
  form.parse(req, async (err, fields, files) => {
    // console.log(files);
    let image = files.mua_portfolio;
    let imageFile: formidable.File = Array.isArray(image) ? image[0] : image;
    let image_filename = imageFile?.newFilename;
    if (err) {
      res.status(400);
      res.end("Failed to upload photo: " + String(err));
      return;
    }
    if (req.session.user) {
      await client.query(
        "insert into portfolio (muas_id, mua_portfolio) values ($1 , $2)",
        [req.session.user.id, image_filename]
      );
    } else {
      res.status(400);
      res.json({ message: "please login first" });
    }

    // res.json({});
  });
});

// let req = Request

profileRoutes.get("/currentUser", (req, res) => {
  res.json(req.session.user);
});

profileRoutes.get("/profile", async (req, res) => {
  let muas_id = req.query.id;
  console.log(muas_id);
  let result = await client.query(
    `
select 
  introduction 
, nickname
, icon
from muas
inner join users on users.id = muas_id 
where muas_id = $1
`,
    [muas_id]
  );
  let user = result.rows[0];
  let result2 = await client.query(
    `
select * from portfolio where muas_id = $1
`,
    [muas_id]
  );
  console.log("result.Rows!!!!" + result2.rows[0]);
  let works = result.rows;
  // console.log(result.rows);
  // let intros = result.rows;
  let currentUser = req.session.user?.id;
  res.json({ user, works, currentUser });
});

profileRoutes.get("/showWork", async (req, res) => {
  let muas_id = req.query.id;
  console.log(muas_id);
  let result = await client.query(
    `select * from portfolio where muas_id = ${muas_id}`
  );
  console.log(result.rows);
  let works = result.rows;
  res.json(works);
});

profileRoutes.get("/showDetails", async (req, res) => {
  let muas_id = req.query.id;
  console.log(muas_id);
  let result = await client.query(
    `select introduction from muas where muas_id = ${muas_id}`
  );
  // console.log(result.rows);
  let intros = result.rows;
  res.json(intros);
});

profileRoutes.get("/showNickname", async (req, res) => {
  let muas_id = req.query.id;
  let result = await client.query(
    `select nickname from users where id = ${muas_id}`
  );
  let nicknames = result.rows;
  res.json(nicknames);
});

profileRoutes.get("/showIcon", async (req, res) => {
  let muas_id = req.query.id;
  let result = await client.query(
    `select icon from muas where muas_id = ${muas_id}`
  );
  let icons = result.rows;
  res.json(icons);
});

profileRoutes.patch("/editIntro", async (req, res) => {
  console.log(req.body);
  console.log(req.query.id);
  let newContent = req.body.content;
  let muas_id = req.query.id;
  let result = await client.query(
    `update muas set introduction = '${newContent}' where muas_id =${muas_id}`
  );
  res.json(result);
});
