const passport = require("passport");

function authorized(request, response, next) {
  passport.authenticate("jwt", { session: false }, async (error, user) => {
    if (error || !user) {
      response.status(401).json({ message: error });
      return;
    }
    try {
      request.user = user;
    } catch (error) {
      next(error);
    }
    next();
  })(request, response, next);
}
module.exports = authorized;
