import { Router, RequestHandler, Request, Response } from "express";
import formidable from "formidable";
import { client } from "./database";
import { hashPassword, checkPassword } from "./hash";
import "./session";
import fetch from "cross-fetch";
import grant from "grant";
import { env } from "./env";

// let path = require("path");

export const userRoutes = Router();

//oAuth login in
const grantExpress = grant.express({
  defaults: {
    origin: "http://127.0.0.1:8080",
    transport: "session",
    state: true,
  },
  google: {
    key: env.GOOGLE_CLIENT_ID,
    secret: env.GOOGLE_CLIENT_SECRET,
    scope: ["profile", "email"],
    callback: "/login/google",
  },
});

userRoutes.use(grantExpress as RequestHandler);
userRoutes.get("/login/google", loginGoogle);

async function loginGoogle(req: Request, res: Response) {
  // console.log("#loginGoogle", req.session?.["grant"]);
  const accessToken = req.session?.["grant"]?.response.access_token;
  const fetchRes = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      method: "get",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const result = await fetchRes.json();
  const users = (
    await client.query(`SELECT * FROM users WHERE email = $1`, [result.email])
  ).rows;
  let user = users[0];
  if (!user) {
    // Create the user when the user does not exist
    user = (
      await client.query(
        `INSERT INTO users (username,email)
                VALUES ($1,$2) RETURNING *`,
        [result.email, result.email]
      )
    ).rows[0];
  }
  if (req.session) {
    req.session["user"] = {
      id: user.id,
      username: user.username,
    };
  }
  return res.redirect("/");
}

let uploadDir = "uploads"; //folder name

//formidable
let counter = 0;
const form = formidable({
  uploadDir,
  keepExtensions: true,
  maxFiles: 1,
  maxFileSize: 500 * 1024 ** 2,
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
  // console.log(username, password);
  const users = await client.query(`select * from users where username= $1`, [
    username,
  ]);
  const userBanned = await client.query(
    `select * from  ban where muas_username = $1`,
    [username]
  );
  if (userBanned.rows.length > 0) {
    res.status(401);
    res.json({
      error: "this user has been banned",
    });
    return;
  }
  if (users.rows.length == 0) {
    res.status(404);
    res.json({
      error: "user does not exist!",
    });
    return;
  }
  const user = users.rows[0];
  console.log(user);

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
  req.session.save();

  res.status(200);
  res.json({ success: true });
});

// TODO update profile

// Logout
userRoutes.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500);
      res.end("Failed to logout");
    }
  });
  res.json({});
});

//redirect to sign up page from login page
userRoutes.use("/signUpLink", (req, res) => {
  res.redirect("/signUp/signUp.html");
});
// sign up Profile (Formitable from)
//handle sign up form
userRoutes.post("/signUp", (req, res) => {
  form.parse(req, async (err, fields, files) => {
    let hashedPassword = await hashPassword(fields.password as string);
    // console.log({ err, fields, files });
    // console.log(hashedPassword);
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

    const rows = await client.query(
      /*sql*/ "insert into users (username,email,profilepic, nickname, password_hash, date_of_birth) values ($1,$2,$3,$4,$5,$6) returning id",
      [
        fields.username,
        fields.email,
        image_filename,
        fields.nickName,
        hashedPassword,
        fields.birthday as string,
      ]
    );
    const userId = rows.rows[0].id;

    req.session["user"] = { id: userId, username: fields.username as string };
    req.session.save();

    res.json({});
  });
});


