import { Client } from "pg";
import dotenv from "dotenv";
import { env } from "./env";

dotenv.config();

export const client = new Client({
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT as any,
  //   host: env.DB_HOST,
});

client.connect().catch((err) => {
  console.error("Failed to connect to database", err);
  process.exit(1);
});


// async function showUsers() {
//   let users = await client.query(`select * from users`);
//   console.log(users);
// }

// showUsers();
