const { OAuth2Client } = require("google-auth-library");
const User = require("../models/userModel");
const logger = require("../config/logger");
const jwt = require("jsonwebtoken");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verify(token) {
  if (!token) throw "Please provide a id_token";
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload) throw "Invalid token";

    const userid = payload["sub"];
    // const name = payload["name"];
    const email = payload["email"];

    let isNew = false;
    const jwtToken = jwt.sign({ email: email }, process.env.TOKEN_SECRET);

    const currentUser = await User.findOne({ email: email });

    if (!currentUser) {
      // if not, create user in our db
      isNew = true;
      await new User({
        email: email,
      }).save();
    }
    logger.info(`app/google user. isNew:${isNew} username:${username}`);
    return { jwt: jwtToken, isNew: currentUser.username ? false : true };
  } catch (err) {
    logger.err(err);
    throw "Invalid Token";
  }
}

module.exports = verify;
