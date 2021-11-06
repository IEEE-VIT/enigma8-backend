const passport = require("passport");
const { response } = require("../config/responseSchema");

function authorized(request, res, next) {
  passport.authenticate("jwt", { session: false }, async (error, user) => {
    if (error || !user) {
      response(res, {}, 401, "Please authenticate yourself", false)
      return;
    }
    try {
      request.user = user;
    } catch (error) {
      next(error);
    }
    next();
  })(request, res, next);
}
module.exports = authorized;
