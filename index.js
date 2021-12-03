const { Client } = require("@notionhq/client");
const notionClient = new Client({
  auth: "secret_4zre1IXKeaoVfeD7bRRQ4AsACKXsoUZ3jE7KHTO9Po9",
});

const DAY = 13; // 이 숫자를 하루씩 올려주세요

const bootCampStudentList = [
  "강서지",
  "공우정",
  "구완모",
  "기웅민",
  "김경태",
  "김단",
  "김예림",
  "나상민",
  "노영진",
  "박규리",
  "박혜민",
  "서동수",
  "서현욱",
  "신요한",
  "오성훈",
  "옥지수",
  "윤진경",
  "윤진호",
  "이수인",
  "이시현",
  "이양우",
  "이찬주",
  "이호찬",
  "임소정",
  "장혜식",
  "전수진",
  "조은별",
  "최리",
  "최민지",
  "최서영",
  "하태용",
  "한소영",
  "한지원",
];

const assigner = {};

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

  let csvContent = "data:text/csv;charset=utf-8,";

  peerReviewerList.forEach((peerSet) => {
    let row = peerSet.join(",");
    csvContent += row + "\r\n";
  });

  // peerReviewerList 가 배분된 결과
  peerReviewerList.forEach((el) => console.log(el));

  try {
    // 이를 노션 데이터베이스에 반영하기 위해서는..

    // 1. 데이터베이스를 "retrieve" 하여 각 필드에 어떤 값이 들어갈 수 있는지 알아낸다 (multi select)

    // 예시 데이터: retrieve_database.json
    const databaseSchemeRes = await notionClient.databases.retrieve({
      database_id: "d9f7eb8e1a274375966939e4cd841f1c",
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

    // 2. 데이터베이스에 "query" 하여 이름을 key, row id를 value 로 하는 객체를 생성한다

    // 예시 데이터: query_database.json
    const { results: queryResults } = await notionClient.databases.query({
      database_id: "d9f7eb8e1a274375966939e4cd841f1c",
      sorts: [
        {
          direction: "ascending",
          property: "이름",
          timestamp: "created_time",
        },
      ],
    });

    const nameToRowIdMapper = queryResults.reduce((acc, row) => {
      acc[row.properties["이름"].title[0].plain_text] = row.id;

      return acc;
    }, {});

    console.log(nameToRowIdMapper);

    // 3. 준비된 데이터들을 활용하여 분배 결과를 데이터베이스에 업데이트 ("patch")
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
