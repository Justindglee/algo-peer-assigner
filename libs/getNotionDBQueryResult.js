import env from "dotenv";
env.config();
import getNotionClient from "../utils/getNotionClient.js";
import { EXCLUDED_STUDENTS } from "../constants/index.js";

const notionClient = getNotionClient();

async function getNotionDBQueryResult() {
  // 예시 데이터: query_database.json
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

  return results.filter((el) => {
    const studentName = el.properties["이름"].title[0].plain_text;

    return !EXCLUDED_STUDENTS.includes(studentName);
  });
}

export default getNotionDBQueryResult;
