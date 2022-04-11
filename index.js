import env from "dotenv";
env.config();
import getNotionClient from "./utils/getNotionClient.js";
import getPropertySchemaList from "./libs/getPropertySchemaList.js";
import getNotionDBQueryResult from "./libs/getNotionDBQueryResult.js";
import getPeerReviewerList from "./libs/getPeerReviewerList.js";

const notionClient = getNotionClient();

async function assignAlgoReviewer() {
  try {
    /*

      1. 데이터베이스를 "retrieve" 하여 각 필드에 어떤 값이 들어갈 수 있는지 알아낸다 (multi select)

      예시 데이터: retrieve_database.json

    */
    const propertySchemaList = await getPropertySchemaList();
    console.log("schema list...", propertySchemaList);

    /*

      2. 데이터베이스에 "query" 하여 현재의 데이터베이스를 정보를 가져오고,
      이를 바탕으로 { name: rowId } 형태의 객체를 생성한다.

      예시 데이터: query_database.json

    */
    const queryResult = await getNotionDBQueryResult();

    const nameToRowIdMapper = queryResult.reduce((acc, row) => {
      acc[row.properties["이름"].title[0].plain_text] = row.id;

      return acc;
    }, {});

    console.log("{ name: rowId }\n", nameToRowIdMapper);

    /*

      3. 노션DB에 쿼리하여 가져온 부트캠프 학생 이름 리스트를 바탕으로 2인 1조의 리뷰어 리스트를 만든다.

    */

    const bootcampStudentList = queryResult.map(
      (el) => el.properties["이름"].title[0].plain_text
    );

    const peerReviewerList = getPeerReviewerList(bootcampStudentList);

    if (peerReviewerList.length !== bootcampStudentList.length) {
      console.log("할당해야할 리뷰어 수가 일치하지 않습니다");
      return;
    }

    console.log("\n<=== 리뷰어 분배내역 (peerReviewerList) ===>");
    peerReviewerList.forEach((el) => console.log(el));
    console.log("<=== 리뷰어 분배내역 끝 ===>\n");

    /*

      4. 이전 단계들에서 준비된 데이터들을 활용하여 분배 결과를 데이터베이스에 업데이트(patch)한다.

    */
    Object.entries(nameToRowIdMapper).forEach(([name, pageId], index) => {
      // TODO: index 대신 name으로 (peerReviewerList 데이터 구조 객체로 변경)
      const [codeReviewer1, codeReviewer2] = peerReviewerList[index];

      const codeReviewer1Color = propertySchemaList["코드리뷰 1"].find(
        (option) => option.name === codeReviewer1
      ).color;

      const codeReviewer2Color = propertySchemaList["코드리뷰 2"].find(
        (option) => option.name === codeReviewer2
      ).color;

      console.log("코드리뷰 1", codeReviewer1, codeReviewer1Color);
      console.log("코드리뷰 2", codeReviewer2, codeReviewer2Color);

      notionClient.pages.update({
        page_id: pageId,
        properties: {
          "코드리뷰 1": {
            multi_select: [
              {
                name: codeReviewer1,
                color: codeReviewer1Color,
              },
            ],
          },
          "코드리뷰 2": {
            multi_select: [
              {
                name: codeReviewer2,
                color: codeReviewer2Color,
              },
            ],
          },
        },
      });
    });
  } catch (err) {
    console.log(err);
  }
}

assignAlgoReviewer();
