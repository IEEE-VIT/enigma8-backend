const { OAuth2Client } = require("google-auth-library");
const User = require("../models/userModel");

const jwt = require("jsonwebtoken");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verify(token) {
  if (!token) throw err("Please provide a id_token");
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const userid = payload["sub"];
    const name = payload["name"];

    const jwtToken = jwt.sign({ id: userid }, process.env.TOKEN_SECRET);

    const currentUser = await User.findOne({ oAuthId: userid });

    if (!currentUser) {
      // if not, create user in our db
      await new User({
        oAuthId: userid,
        username: name,
      }).save();
    }
    return { jwt: jwtToken };
  } catch (err) {
    return err;
  }
}

module.exports = verify;
