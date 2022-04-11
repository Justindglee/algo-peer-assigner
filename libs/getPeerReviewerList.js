import { DAY } from "../constants/index.js";

function getPeerReviewerList(bootcampStudentList) {
  const students1 = [...bootcampStudentList];
  const students2 = [...bootcampStudentList];
  const peerReviewerList = new Array(students1.length)
    .fill(null)
    .map((item) => []);

  // 0 혹은 33이 나오면 안됩니다.
  let calculatedDay = (DAY % (bootcampStudentList.length - 1)) + 1;

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

  return peerReviewerList;
}

export default getPeerReviewerList;
