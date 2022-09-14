import expressSession from "express-session";

let sessionSecret = Math.random().toString(36).slice(2);

export let sessionMiddleware = expressSession({
  secret: sessionSecret,
  saveUninitialized: true,
  resave: true,
  //cookie: { secure: true },
});

declare module "express-session" {
  interface SessionData {
    user?: SessionUser;
  }
}

export type SessionUser = {
  id: string;
  username: string;
};
