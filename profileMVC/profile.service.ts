import { Client } from "pg";
import { HTTPError } from "./error";

export class ProfileService {
  constructor(private client: Client) {}

  async addWork(
    id: number,
    image_filename: string
    // doneForm: {
    // id: number;
    // image_filename: string;
  ): Promise<{ message: string }> {
    let result = await this.client.query(
      "insert into portfolio (muas_id, mua_portfolio) values ($1 , $2)",
      [id, image_filename]
    );
    let message = result.rows[0];
    return message;
  }
}
