const constants = {
  maxScore: 100,
  minScore: 60,
  perSolve: 5,
  groupBy: 10,
};

// add noOfSolves to be added in question model

const dynamicScoring = (noOfSolves: number): number => {
  let score: number;
  const maxScore: number = constants.maxScore;
  const groupedSolves: number = noOfSolves / constants.groupBy;

  const shouldBeScore: number = maxScore - groupedSolves * constants.perSolve;
  if (shouldBeScore < constants.minScore) {
    score = constants.minScore;
  } else {
    score = shouldBeScore;
  }

  return score;
};