// import { profile } from "console";
import express, { Request, Response, NextFunction, Router } from "express";
import formidable from "formidable";
import fs from "fs";
// import { resourceLimits } from "worker_threads";
import { client } from "./database";
import "./session";
import { hashPassword } from "./hash";

export let profileRoutes = Router();

const uploadDir = "./uploads";
fs.mkdirSync(uploadDir, { recursive: true });

let counter = 0;
const form = formidable({
  uploadDir,
  keepExtensions: true,
  maxFiles: 1,
  maxFileSize: 200 * 1024 ** 2, // the default limit is 200KB
  filter: (part) => part.mimetype?.startsWith("image/") || false,
  filename: (originalName, originalExt, part, form) => {
    counter++;
    let fieldName = part.name;
    let timestamp = Date.now();
    let ext = part.mimetype?.split("/").pop();
    return `${fieldName}-${timestamp}-${counter}.${ext}`;
  },
});

profileRoutes.post("/addWork", (req, res) => {
  try {
    form.parse(req, async (err, fields, files) => {
      console.log(fields);
      try {
        let image = files.mua_portfolio;
        let imageFile: formidable.File = Array.isArray(image)
          ? image[0]
          : image;
        let image_filename = imageFile?.newFilename;
        if (err) {
          res.status(400);
          res.end("Failed to upload photo: " + String(err));
          return;
        }
        if (req.session.user && !fields) {
          await client.query(
            "insert into portfolio (muas_id, mua_portfolio) values ($1 , $2)",
            [req.session.user.id, image_filename]
          );
        }
        if (req.session.user && fields) {
          await client.query(
            "insert into portfolio (muas_id, mua_portfolio, mua_description) values ($1 , $2, $3)",
            [req.session.user.id, image_filename, fields.mua_description]
          );
        }
      } catch (error) {
        res.status(400);
        res.json({ message: "file cannot be empty" });
        return;
      }

      res.json({ message: "upload success!" });
    });
  } catch (error) {
    res.status(401);
    res.json({ message: "please login first" });
  }
});

profileRoutes.delete("/deletePortfolio", async (req, res) => {
  let mua_portfolio = req.body.insideImage;
  console.log(mua_portfolio);
  await client.query(
    `delete from portfolio where mua_portfolio = '${mua_portfolio}'`
  );
});

profileRoutes.get("/profile", async (req, res) => {
  let muas_id = req.query.id;
  console.log(muas_id);
  let result = await client.query(
    `
select 
  introduction 
, nickname
, profilepic
from muas
inner join users on users.id = muas_id 
where muas_id = $1
`,
    [muas_id]
  );
  let user = result.rows[0];
  result = await client.query(
    `select * from portfolio where muas_id = $1
    `,
    [muas_id]
  );
  console.log(result.rows);
  let works = result.rows;
  // console.log(result.rows);
  // let intros = result.rows;
  let currentUser = req.session.user?.id;
  console.log({ user, works, currentUser });
  res.json({ user, works, currentUser });
});

// profileRoutes.patch("/editIntro", async (req, res) => {
//   console.log(req.body);
//   console.log(req.query.id);
//   let newContent = req.body.content;
//   let muas_id = req.query.id;
//   let result = await client.query(
//     `update muas set introduction = '${newContent}' where muas_id = '${muas_id}'`
//   );
//   res.json(result);
// });

profileRoutes.patch("/editDescription", async (req, res) => {
  //console.log("here?");

  //console.log(req.body);
  // console.log(req.query.id);
  let newContent = req.body.content;
  let muas_image = req.body.image.split("/").slice("4");
  console.log(muas_image);
  // let muas_id = req.query.id;
  let result = await client.query(
    `update portfolio set mua_description = '${newContent}' where mua_portfolio = '${muas_image}'`
  );
  res.json(result);
});

//for update profile information
profileRoutes.post("/profileUpdate", async (req, res) => {
  let currentId = req.query.id;
  console.log("currentID" + currentId);
  form.parse(req, async (err, fields, files) => {
    let hashedPassword = await hashPassword(fields.newPassword as string);
    let newNicknameAtForm = fields.newNickname;
    let newDescriptionForm = fields.newDescription;
    console.log({ err, fields, files });
    // console.log(hashedPassword);
    let image = files.newIcon;
    let imageFile = Array.isArray(image) ? image[0] : image;
    let image_filename = imageFile?.newFilename;
    if (Array.isArray(fields.data)) {
      res.status(402);
      res.json({
        error: "Invalid format",
      });
      return;
    }
    // console.log(
    //   /*sql*/ `update users set nickname = $1, password_hash = $2, profilepic = $3 ,  where users.id= $4`,
    //   [newNicknameAtForm, hashedPassword, image_filename, currentId],
    //   /*sql*/ `update muas set introduction = $1 where muas_id = $2`,
    //   [newDescriptionForm, currentId]
    // );
    const updateFinish = await client.query(
      /*sql*/ `update users set nickname = $1, password_hash = $2, profilepic = $3 where users.id= $4`,
      [newNicknameAtForm, hashedPassword, image_filename, currentId]
    );
    const updateDescription = await client.query(
      /*sql*/ `update muas set introduction = $1 where muas_id = $2`,
      [newDescriptionForm, currentId]
    );
    console.log(updateFinish);
    res.json({ message: "Success" });
  });
});

// Rating system -- comment

profileRoutes.post("/comment", async (req, res) => {
  // See if there is record before action
  let ratingRecordBefore = await client.query(
    `select users_id, muas_id from ratings where users_id = $1 and muas_id = $2`,
    [req.body.from, req.body.to]
  );
  // does not => update, does => insert
  if (ratingRecordBefore.rows.length == 0) {
    await client.query(
      `insert into ratings (users_id, muas_id, score) values ($1, $2, $3)`,
      [req.body.from, req.body.to, req.body.action]
    );
  } else {
    await client.query(
      `update ratings set "score" = $3 where users_id = $1 and muas_id = $2 `,
      [req.body.from, req.body.to, req.body.action]
    );
  }
  // See what is the total score of the mua

  let ratingRecordAfter = await client.query(
    `select users_id, muas_id, score from ratings where muas_id = $1`,
    [req.body.to]
  );

  let totalScore = 0;

  for (let record of ratingRecordAfter.rows) {
    totalScore += record.score;
  }

  console.log("totalScore of the mua: ", totalScore);

  await client.query(`update muas set "avg_score" = $1 where muas_id = $2 `, [
    totalScore,
    req.body.to,
  ]);

  res.json(req.body.action);
});

// Rating System -- show comment qty

profileRoutes.get("/score", async (req, res) => {
  let pageId = req.query.id;
  let comments = await client.query(
    `select users_id, muas_id, score from ratings where muas_id = $1`,
    [pageId]
  );
  //console.log("commentAll: ", comments);

  res.json(comments.rows);
});
