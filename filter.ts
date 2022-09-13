import { client } from "./database";

async function main(x: any) {
//   await client.query("INSERT INTO users (username,password) values ($1,$2)", [
//     "user.username",
//     "user.password",
//   ]);

  let result = await client.query("SELECT * from categories");
  console.log(result.rows);
  console.log(x);
  
  await client.end(); // close connection with the database
}
main(123123123);



