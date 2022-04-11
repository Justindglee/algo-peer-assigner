import env from "dotenv";
env.config();
import getNotionClient from "../utils/getNotionClient.js";

const notionClient = getNotionClient();

async function getNotionDBQueryResult() {
  const { results } = await notionClient.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
    sorts: [
      {
        direction: "ascending",
        property: "이름",
        timestamp: "created_time",
      },
    ],
  });

  return results;
}

export default getNotionDBQueryResult;
