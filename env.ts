import { config } from "dotenv";
import populateEnv from "populate-env";

config();

export let env = {
  DB_NAME: "",
  DB_USERNAME: "",
  DB_PASSWORD: "",
  // DB_HOST: "",
  PORT: +"",
  // SESSION_SECET: "",
  // ORIGIN: "",
  // GOOGLE_CLIENT_ID: "",
  // GOOGLE_CLIENT_SECRET: "",
};

populateEnv(env, { mode: "halt" });
