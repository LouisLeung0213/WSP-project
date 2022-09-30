import { Request, Response, Router } from "express";
import { HTTPError } from "../error";

export class RestfulController {
  router = Router();

  //   wrapMethod(fn: (req: Request) => object | Promise<object>) {
  //     return async (req: Request, res: Response) => {
  //       try {
  //         let json = await fn(req);
  //         res.json(json);
  //       } catch (err) {
  //         let code = (err as HTTPError).status || 500;
  //         res.status(code);
  //         res.json({ error: String(err) });
  //       }
  //     };
  //   }
}
