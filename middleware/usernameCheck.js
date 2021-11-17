const { response } = require("../config/responseSchema");

const isUsernameSet = (req, res, next) => {
  if (!req.user.username) {
    response(
      res,
      {},
      400,
      "Please set a username before using this route",
      false
    );
    return;
  }
  next();
};
module.exports = isUsernameSet;
