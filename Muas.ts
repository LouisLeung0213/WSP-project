import { Router, RequestHandler, Request, Response } from "express";
import formidable from "formidable";
import { client } from "./database";
import "./session";

export const muaRoutes = Router();
