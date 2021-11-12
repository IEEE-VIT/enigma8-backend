const User = require("../models/userModel");
const { getLeaderboardSchema } = require("../config/requestSchema");
const { response } = require("../config/responseSchema");

exports.getLeaderboard = async (req, res) => {
  try {
    const uname = req.user.username;

    if(!req.body.page){
      throw new Error("Please enter page");
    }
    else if(!req.body.query){
      throw new Error("Please enter query");
    }
    else if(!req.body.perPage){
      throw new Error("Please enter perPage");
    }

    const { page, query, perPage } = await getLeaderboardSchema.validateAsync(
      req.query
    );

    const allData = await User.find(
      { username: { $ne: null } },
      { username: 1, score: 1, stars: 1 }
    ).sort({ score: -1, scoreLastUpdated: 1 });

    let startRank = 1;
    const rankedData = allData.map(({ username, score, stars }) => {
      return { username, score, questionsSolved: stars, rank: startRank++ };
    });

    const userRank = rankedData.filter(({ username }) => uname === username)[0];

    const pageStartRank = (page - 1) * perPage;

    let queryData;
    if (query)
      queryData = rankedData.filter(({ username }) => username.includes(query));

    console.log(queryData);
    const leaderboard = queryData
      ? queryData.slice(pageStartRank, pageStartRank + perPage)
      : rankedData.slice(pageStartRank, pageStartRank + perPage);

    const totalPage = Math.ceil(
      (queryData ? queryData.length : allData.length) / perPage
    );
    if (page > totalPage) throw new Error("page number not valid");
    response(res, {
      page: page,
      userRank,
      leaderboard,
      totalPage,
    });
  } catch (err) {
    response(res, {}, 400, err.message, false);
  }
};
