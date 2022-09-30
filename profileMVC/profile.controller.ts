import formidable from "formidable";
import fs from "fs";
import { ProfileService } from "./profile.service";
import { RestfulController } from "./restful.controller";
import { Request, Response } from "express";
import { HTTPError } from "../error";
import { number, object, string } from "cast.ts";

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

// let doneFromParser = object({
//   id: number(),
//   image_filename: string(),
// });

export class ProfileController extends RestfulController {
  constructor(private profileService: ProfileService) {
    super();
    this.router.post("/addWork", this.addWork);
  }
  addWork = async (req: Request, res: Response) => {
    try {
      form.parse(req, async (err, fields, files) => {
        let id = parseInt(req.session.user!.id);
        let image = files.mua_portfolio;
        let imageFile: formidable.File = Array.isArray(image)
          ? image[0]
          : image;
        let image_filename = imageFile?.newFilename;
        // let doneForm = [{ id, image_filename }];
        // let items = doneFromParser.parse(doneForm);
        if (err) {
          throw new HTTPError(400, "Failed to upload photo");
        }
        let json = await this.profileService.addWork(id, image_filename);
        res.json(json);
      });
    } catch (error) {
      res.status(400);
      res.json({ message: "file cannot be empty" });
      return;
    }
  };
}
