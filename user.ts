import { Router } from "express";
import formidable from "formidable";
import { client } from "./database";
import { hashPassword, checkPassword } from "./hash";
import "./session";

// let path = require("path");

export const userRoutes = Router();

let uploadDir = "uploads"; //folder name

//formidable
let counter = 0;
const form = formidable({
  uploadDir,
  keepExtensions: true,
  maxFiles: 1,
  maxFileSize: 10 * 1024 ** 2,
  filter: (part) => part.mimetype?.startsWith("image/") || false,
  filename: (originalName, originalExt, part, form) => {
    counter++;
    let fieldName = part.name;
    let timestamp = Date.now();
    let ext = part.mimetype?.split("/").pop();
    return `${fieldName}-${timestamp}-${counter}.${ext}`;
  },
});

type User = {
  username: string;
};

// Login
userRoutes.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const users = await client.query(
    `select password_hash from users where username= $1`,
    [username]
  );
  if (users.rows.length == 0) {
    res.status(404);
    res.json({
      error: "user does not exist!",
    });
    return;
  }
  const user = users.rows[0];
  const check = await checkPassword(password, user.password_hash);
  if (!check) {
    res.status(402);
    res.json({
      error: "Wrong Password!",
    });
    return;
  }

  //AJAX
  req.session["user"] = { id: user.id, username: user.username };
  res.status(200);
  res.json({ success: true });
});

// TODO up data profile

// TODO Logout
userRoutes.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500);
      res.end("Failed to logout");
    }
  });
});

// sign up Profile (Formitable from)
//redirect to sign up page from login page
userRoutes.use("/signUpLink", (req, res) => {
  res.redirect("/signUp/signUp.html");
});

//handle sign up form
userRoutes.post("/signUp", (req, res) => {
  form.parse(req, async (err, fields, files) => {
    let hashedPassword = await hashPassword(fields.password as string);
    console.log({ err, fields, files });
    console.log(hashedPassword);
    let image = files.image;
    let imageFile = Array.isArray(image) ? image[0] : image;
    let image_filename = imageFile?.newFilename;
    if (Array.isArray(fields.data)) {
      res.status(402);
      res.json({
        error: "Invalid format",
      });
      return;
    }

    let dbUserName = await client.query(
      `select * from users where username = ($1)`,
      [fields.username]
    );
    let dbEmail = await client.query(`select * from users where email = ($1)`, [
      fields.email,
    ]);
    let dbNickName = await client.query(
      `select * from users where nickname = ($1)`,
      [fields.nickname]
    );
    if (dbUserName.rows.length != 0) {
      res.status(400);
      res.json({ error: "Username already exist, please use other name" });
      return;
    }
    if (dbEmail.rows.length != 0) {
      res.status(403);
      res.json({ error: "Email already been used, please use another email" });
      return;
    }
    if (dbNickName.rows.length != 0) {
      res.status(406);
      res.json({ error: "Nickname already exist, please use other name" });
      return;
    }

    await client.query(
      /*sql*/ "insert into users (username,email,profilepic, nickname, password_hash, date_of_birth) values ($1,$2,$3,$4,$5,$6)",
      [
        fields.username,
        fields.email,
        image_filename,
        fields.nickName,
        hashedPassword,
        fields.birthday as string,
      ]
    );
    res.json({});
  });
});
