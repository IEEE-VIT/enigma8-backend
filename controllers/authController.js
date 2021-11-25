const { OAuth2Client } = require("google-auth-library");
const verifyAppleToken = require("verify-apple-id-token").default;

const User = require("../models/userModel");
const logger = require("../config/logger");
const jwt = require("jsonwebtoken");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function googleVerify(token) {
  if (!token) throw new Error("please provide a id_token");
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload) throw new Error("invalid token");

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
      return { jwt: jwtToken, isNew: true };
    }
    logger.info(
      `app/google user. isNew:${currentUser.username ? false : true} username:${
        currentUser.username
      }`
    );
    return { jwt: jwtToken, isNew: currentUser.username ? false : true };
  } catch (err) {
    logger.error(err + "");
    throw new Error("invalid Token");
  }
}

const appleVerify = async (id_token) => {
  try {
    const jwtClaims = await verifyAppleToken({
      idToken: id_token,
      clientId: "ieee.enigma",
    });
    let isNew = false;
    const email = jwtClaims.email;
    const jwtToken = jwt.sign({ email: email }, process.env.TOKEN_SECRET);

    const currentUser = await User.findOne({ email: email });

    if (!currentUser) {
      // if not, create user in our db
      isNew = true;
      await new User({
        email: email,
      }).save();
      return { jwt: jwtToken, isNew: true };
    }
    logger.info(
      `app/apple user. isNew:${currentUser.username ? false : true} username:${
        currentUser.username
      }`
    );
    return { jwt: jwtToken, isNew: currentUser.username ? false : true };
  } catch (err) {
    logger.error(err + "");
    throw new Error("invalid Token");
  }
};

const appleVerifyWeb = async (id_token) => {
  try {
    const jwtClaims = await verifyAppleToken({
      idToken: id_token,
      clientId: "com.enigma7.0",
    });
    let isNew = false;
    const email = jwtClaims.email;
    const jwtToken = jwt.sign({ email: email }, process.env.TOKEN_SECRET);

    const currentUser = await User.findOne({ email: email });

    if (!currentUser) {
      // if not, create user in our db
      isNew = true;
      await new User({
        email: email,
      }).save();
      return { jwt: jwtToken, isNew: true };
    }
    logger.info(
      `web/apple user. isNew:${currentUser.username ? false : true} username:${
        currentUser.username
      }`
    );
    return { jwt: jwtToken, isNew: currentUser.username ? false : true };
  } catch (err) {
    logger.error(err + "");
    throw new Error("invalid Token");
  }
};

module.exports = { googleVerify, appleVerify, appleVerifyWeb };
