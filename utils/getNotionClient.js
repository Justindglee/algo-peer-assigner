import env from "dotenv";
env.config();
import { Client } from "@notionhq/client";

export default (function () {
  let notionClient;

  return function () {
    if (!notionClient) {
      notionClient = new Client({
        auth: process.env.NOTION_API_KEY,
      });
    }

    return notionClient;
  };
})();
