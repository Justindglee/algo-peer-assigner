function mixOrder(arr) {
  const originalArr = [...arr];

  const halfIndex = Math.floor(originalArr.length / 2);
  const randomIndex = Math.floor(
    Math.random() * originalArr.length || halfIndex
  );

  const slicedArr = originalArr.splice(randomIndex);
  const result = slicedArr.concat(originalArr);

  return result;
}

function assignPeers(peerReviewerList, peerList) {
  Object.keys(peerReviewerList).forEach((studentName, index) => {
    peerReviewerList[studentName].push(peerList[index]);
  });

  return peerReviewerList;
}

function getPeerReviewerList(studentList) {
  const firstPeerList = mixOrder(studentList);
  let secondPeerList = mixOrder(studentList);

  (function processMixOrder() {
    if (firstPeerList[0] !== secondPeerList[0]) {
      return;
    }

    secondPeerList = mixOrder(secondPeerList);

    processMixOrder();
  })();

  const peerReviewerList = studentList.reduce((acc, studentName) => {
    acc[studentName] = [];

    return acc;
  }, {});

  const assignedResult = assignPeers(
    assignPeers(peerReviewerList, firstPeerList),
    secondPeerList
  );

  return assignedResult;
}

export default getPeerReviewerList;
