const User = require("../models/userModel");
const { getLeaderboardSchema } = require("../config/requestSchema");
const { response } = require("../config/responseSchema");

exports.getLeaderboard = async (req, res) => {
  try {
    const uname = req.user.username;

    const { page, query, perPage } = await getLeaderboardSchema.validateAsync(
      req.query
    );

    const allData = await User.find(
      { username: { $ne: null } },
      { username: 1, score: 1 }
    ).sort({ score: -1, scoreLastUpdated: 1 });

    let startRank = 1;
    const rankedData = allData.map(({ username, score }) => {
      return { username, score, rank: startRank++ };
    });

    const userRank = rankedData.filter(({ username }) => uname === username)[0];

    const pageStartRank = (page - 1) * perPage;
    const leaderboard = query
      ? rankedData
          .filter(({ username }) => username.includes(query))
          .slice(0, perPage)
      : rankedData.slice(pageStartRank, pageStartRank + perPage);

    response(res, {
      page: page,
      userRank,
      leaderboard,
    });
  } catch (err) {
    response(res, {}, 400, err.message, false);
  }
};
