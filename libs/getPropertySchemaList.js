import env from "dotenv";
env.config();
import getNotionClient from "../utils/getNotionClient.js";

const notionClient = getNotionClient();

async function getPropertySchemaList() {
  const databaseSchemeRes = await notionClient.databases.retrieve({
    database_id: process.env.NOTION_DATABASE_ID,
  });

  const propertySchemaList = Object.values(databaseSchemeRes.properties).reduce(
    (acc, { name: propertyName, ...rest }) => {
      if (rest.multi_select) {
        acc[propertyName] = rest.multi_select.options;
      }

      return acc;
    },
    {}
  );

  return propertySchemaList;
}

export default getPropertySchemaList;
