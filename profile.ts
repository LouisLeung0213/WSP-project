import { Router } from "express";
import formidable from "formidable";
import fs from "fs";
import { client } from "./database";
import "./session";

export let profileRoutes = Router();

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
  form.parse(req, async (err, fields, files) => {
    console.log(files);
    let image = files.mua_profilo;
    let imageFile: formidable.File = Array.isArray(image) ? image[0] : image;
    let image_filename = imageFile?.newFilename;
    if (err) {
      res.status(400);
      res.end("Failed to upload photo: " + String(err));
      return;
    }
    if (req.session.user) {
      await client.query(
        "insert into profilo (muas_id, mua_profilo) values ($1 , $2)",
        [req.session.user.id, image_filename]
      );
    } else {
      res.status(400);
      res.end("please login first");
    }

    res.json({});
  });
});

profileRoutes.get("/currentUser", (req, res) => {
  res.json(req.session.user);
});
