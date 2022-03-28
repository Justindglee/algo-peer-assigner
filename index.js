import env from "dotenv";
import { Client } from "@notionhq/client";

env.config();

const notionClient = new Client({
  auth: process.env.NOTION_API_KEY,
});

const DAY = 1; // 이 숫자를 하루씩 올려주세요!

const bootCampStudentList = [
  "강민성",
  "강원희",
  "고창윤",
  "공지현",
  "김다은",
  "김민주",
  "김윤건",
  "김종민",
  "김준형",
  "남원일",
  "박세진",
  "박수정",
  "백인빈",
  "서재호",
  "신진욱",
  "유동하",
  "이상아",
  "이선경",
  "이승채",
  "이윤학",
  "임유빈",
  "임태완",
  "장운진",
  "정세현",
  "정혜진",
  "차한솔",
  "최아람",
  "최현오",
  "한경훈",
  "허진권",
  "황인택",
];

async function assignAlgoReviewer(day) {
  const students1 = [...bootCampStudentList];
  const students2 = [...bootCampStudentList];
  const peerReviewerList = new Array(students1.length)
    .fill(null)
    .map((item) => []);

  // 0 혹은 33이 나오면 안됩니다.
  let calculatedDay = (day % (bootCampStudentList.length - 1)) + 1;

  const splicedStudent1 = students1.splice(0, calculatedDay);
  const splicedStudent2 = students2.splice(-calculatedDay);

  const peerReviewer1 = students1.concat(splicedStudent1);
  const peerReviewer2 = splicedStudent2.concat(students2);

  for (let i = 0; i < peerReviewer1.length; i++) {
    peerReviewerList[i].push(peerReviewer1[i]);
  }

  for (let j = 0; j < peerReviewer2.length; j++) {
    peerReviewerList[j].push(peerReviewer2[j]);
  }

  if (peerReviewerList.length !== bootCampStudentList.length) {
    console.log("할당해야할 리뷰어 수가 일치하지 않습니다");
    return;
  }

  peerReviewerList.forEach((el) => console.log(el));

  try {
    /*

      1. 데이터베이스를 "retrieve" 하여 각 필드에 어떤 값이 들어갈 수 있는지 알아낸다 (multi select)

      예시 데이터: retrieve_database.json

    */
    const databaseSchemeRes = await notionClient.databases.retrieve({
      database_id: process.env.NOTION_DATABASE_ID,
    });

    const propertySchemaList = Object.values(
      databaseSchemeRes.properties
    ).reduce((acc, { name: propertyName, ...rest }) => {
      if (rest.multi_select) {
        acc[propertyName] = rest.multi_select.options;
      }

      return acc;
    }, {});

    console.log(propertySchemaList);

    /*

      2. 데이터베이스에 "query" 하여 현재의 데이터베이스를 정보를 가져오고,
      이를 바탕으로 { name: rowId } 형태의 객체를 생성한다.

      예시 데이터: query_database.json

    */
    const { results: queryResults } = await notionClient.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      sorts: [
        {
          direction: "ascending",
          property: "이름",
          timestamp: "created_time",
        },
      ],
    });

    console.log("쿼리 결과", queryResults);

    const nameToRowIdMapper = queryResults.reduce((acc, row) => {
      acc[row.properties["이름"].title[0].plain_text] = row.id;

      return acc;
    }, {});

    console.log(nameToRowIdMapper);

    /*

      3. 1, 2번 단계에서 준비된 데이터들을 활용하여 분배 결과를 데이터베이스에 업데이트(patch)한다.

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

assignAlgoReviewer(DAY);
