import { Client } from "pg";
import dotnev from "dotenv";
import { env } from "./env";

dotnev.config();

export const client = new Client({
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: env.DB_HOST,
});

client.connect().catch((err) => {
  console.error("Failed to connect to database", err);
  process.exit(1);
});
