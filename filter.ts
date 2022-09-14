import { client } from "./database";
import { Router, RequestHandler, Request, Response } from "express";

export const filterRoutes = Router()

filterRoutes.get("/filter", async (req, res) => {
  let result = await client.query("SELECT * from categories");
  let categories = result.rows;
  res.json(categories);
});


filterRoutes.post("/searchFilter", async (req,res) => {
  let params = req.body
  console.log(params.join(' or '))
  let sql = `
  select users.id, username, categories_id from offers join users on 
  muas_id = users.id
  where ${params.join(' or ')};
  ` 

  let result = await client.query(sql)
  console.log(result.rows);
  
  res.json(sql); 
})



