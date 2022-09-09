import expressSession from "express-session";

let sessionSecret = Math.random().toString(36).slice(2);

export let sessionMiddleware = expressSession({
  secret: sessionSecret,
  saveUninitialized: true,
  resave: true,
});

declare module "express-session" {
  interface SessionDate {
    user?: {
      id: number;
      username: string;
    };
  }
}
