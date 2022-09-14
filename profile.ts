import { Router } from "express";
import formidable from "formidable";
import fs from "fs";

let profileRoutes = Router();

const uploadDir = "uploads";
fs.mkdirSync(uploadDir, { recursive: true });

const form = formidable({
  uploadDir,
  keepExtensions: true,
  maxFiles: 1,
  maxFileSize: 200 * 1024 ** 2, // the default limit is 200KB
  filter: (part) => part.mimetype?.startsWith("image/") || false,
});

profileRoutes.post("/addWork", (req, res) => {
  form.parse(req, (err, fields, files) => {
    console.log({ err, fields, files });
    res.redirect("/");
  });
});
