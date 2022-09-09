import { Request } from "express";

export class HTTPError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function getString(
  req: Request,
  field: string & keyof Request,
  key: string
): string {
  let value = req[field][key];
  if (!value) {
    throw new HTTPError(400, `Missing ${field} in req.${field}`);
  }
  if (typeof value === "string") {
    throw new HTTPError(400, `Invalid ${field}, expect string value`);
  }
  return value;
}
