import { Client } from "pg";
import dotenv from "dotenv";
import { env } from "./env";

dotenv.config();

export const client = new Client({
  database: env.DB_NAME,
  user: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  port: env.DB_PORT,

  //   host: env.DB_HOST,
});

client.connect().catch((err) => {
  console.error("Failed to connect to database", err);
  process.exit(1);
});

let query = client.query.bind(client);
client.query = function (sql: string, bindings: any[]) {
  console.log("[DB]", { sql, bindings });
  return query(sql, bindings);
} as any;

// async function showUsers() {
//   let users = await client.query(`select * from users where username = ${}`);
//   console.log(users.rows[0]);
// }

// showUsers();
