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
  res.json({});
});

profileRoutes.get("/profile", async (req, res) => {
  let muas_id = req.query.id;
  console.log(muas_id);
  let result = await client.query(
    `
select 
  muas_id
, introduction 
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

  console.log(req.body);
  // console.log(req.query.id);
  let newContent = req.body.content;
  let muas_image = req.body.image.split("/").slice("4");
  console.log(muas_image);
  // let muas_id = req.query.id;
  let result = await client.query(
    `update portfolio set mua_description = '${newContent}' where mua_portfolio = '${muas_image}'`
  );
  console.log(result);
  res.json(result);
});

//for update profile information
profileRoutes.post("/profileUpdate", async (req, res) => {
  let currentId = req.query.id;
  console.log("currentID" + currentId);
  form.parse(req, async (err, fields, files) => {
    let hashedPassword;
    if (fields.newPassword == "") {
      let result = await client.query(
        `select password_hash from users where users.id = ${currentId}`
      );
      hashedPassword = result.rows[0].password_hash;
    } else {
      hashedPassword = await hashPassword(fields.newPassword as string);
    }
    let newNicknameAtForm;
    if (fields.newNickname == "") {
      let result = await client.query(
        `select nickname from users where users.id = ${currentId}`
      );
      newNicknameAtForm = result.rows[0].nickname;
    } else {
      newNicknameAtForm = fields.newNickname;
    }
    let newDescriptionForm = fields.newDescription;
    console.log({ err, fields, files });
    // console.log(hashedPassword);
    let image_filename;
    if (!files.newIcon) {
      // get from db
      let oldIcon = await client.query(
        `select profilepic from users where users.id = ${currentId}`
      );
      image_filename = oldIcon;
      res.json();
      return;
    } else {
      let image = files.newIcon;
      let imageFile = Array.isArray(image) ? image[0] : image;

      image_filename = imageFile?.newFilename;
    }

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

  res.json(req.body.action);
});

profileRoutes.post("/reportPortfolio", async (req, res) => {
  // console.log();
  let report = await client.query(
    `insert into reported (muas_id,muas_description,muas_image) values ('${
      req.body.mua_id
    }','${req.body.content}','${req.body.image.split("/").slice(4)}')`
  );
  res.json({ report });
  // console.log("report");
  // console.log(req.body);
});
// Rating System -- show comment qty

profileRoutes.get("/score", async (req, res) => {
  let pageId = req.query.id;

  // See what is the total score and average score of the mua

  let ratingRecordAfter = await client.query(
    `select users_id, muas_id, score from ratings where muas_id = $1`,
    [pageId]
  );

  let totalScore = 0;
  let commentQty = 0;

  for (let record of ratingRecordAfter.rows) {
    totalScore += record.score;
    commentQty++;
  }

  let avgScore = Math.round((totalScore / commentQty) * 100) || 0;

  // console.log("totalScore: ", totalScore);
  // console.log("commentQty: ", commentQty);
  // console.log("avgScore: ", avgScore);

  await client.query(`update muas set "total_score" = $1 where muas_id = $2 `, [
    totalScore,
    pageId,
  ]);

  await client.query(`update muas set "avg_score" = $1 where muas_id = $2 `, [
    avgScore,
    pageId,
  ]);

  await client.query(`update muas set "comment_qty" = $1 where muas_id = $2 `, [
    commentQty,
    pageId,
  ]);

  let commentQtyEnough = false;

  if (commentQty > 4) {
    await client.query(
      `update muas set "comment_qty_enough" = true where muas_id = $1 `,
      [pageId]
    );
    commentQtyEnough = true;
  }

  res.json({ totalScore, commentQty, avgScore, commentQtyEnough });
});
