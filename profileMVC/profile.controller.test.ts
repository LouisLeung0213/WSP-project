import { Request, Response } from "express";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";

describe("ProfileController addWork test", () => {
  let profileService: ProfileService;
  let profileController: ProfileController;

  let req: any;
  let res: any;

  beforeAll(() => {
    profileService = {} as any;
    profileService.addWork = jest.fn(() => {
      throw new Error("should not be called");
    });
    profileController = new ProfileController(profileService);
    req = {} as any as Request;
    res = {} as any as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();
    //req.session = {} as any;
  });

  it("should reject if lack of image_filename", async () => {
    req.session.user.id = 1;
    await profileController.addWork(req, res);
    // let req.body.image_filename = "1a2b3c4e5d.jpeg"
    expect(res.status).toBeCalledWith(400);
    expect(res.json).toBeCalledWith({ message: "file cannot be empty" });
  });
});
