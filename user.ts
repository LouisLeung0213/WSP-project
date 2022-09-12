import { Router } from "express";
import "./session";
import formidable from "formidable";
import { appendFile } from "fs";
import { client } from "./database";

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

// TODO Login
// userRoutes.post("/login", (req, res) => {});

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

// TODO sign up Profile (formitable from)

userRoutes.use("/signUpLink", (req, res) => {
  res.redirect("/signUp/signUp.html");
});

userRoutes.post("/signUp", (req, res) => {
  form.parse(req, async (err, fields, files) => {
    console.log({ err, fields, files });
    let image = files.image;
    let imageFile = Array.isArray(image) ? image[0] : image;
    let image_filename = imageFile?.newFilename;
    if (Array.isArray(fields.data)) {
      throw new Error("invalid format");
    }
    //TODO insert data to database
    // client.query(/*sql*/ "insert into users");
  });
});
