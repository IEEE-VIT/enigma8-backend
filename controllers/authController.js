const { OAuth2Client } = require("google-auth-library");
const User = require("../models/userModel");
const logger = require("../config/logger");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const AppleAuth = require("apple-auth");
// const authKey= require();
// const config = fs.readFileSync("./appleConfig.json");

// const client_id=process.env.client_id;
// const team_id=process.env.team_id;
// const redirect_uri=process.env.redirect_uri;
// const key_id=process.env.key_id;
// const scope=process.env.scope;

const config = {
  client_id: "com.enigma7.0",
  team_id: "F8CHS6PHQS",
  redirect_uri: "enigma.ieeevit.org",
  key_id: "LPJCCWULY8",
  scope: "email",
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verify(token) {
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

const auth = new AppleAuth(config, "MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgaQdMf9ceoWrfBJB0ISmQg5YDLtShlXcw6ytEKywwn9agCgYIKoZIzj0DAQehRANCAASgmqKQ+crV7oa/LlSEIPu2pA9l79eCLR4yGCYw0opihU/mdk2nxc5E9X32fH1I13AQrJ4quJLj+k7mmsvI8nNs", "text");

const validateApple = async (grantCode) => {
  try {
    console.log(grantCode);
    console.log(auth);
    // console.log(auth);

    if (!grantCode) throw new Error("please provide a grant code");
    auth._tokenGenerator.generate();

    const access = await auth.accessToken(grantCode);
    console.log("hello", access.id_token);

    if (access === true) {
      console.log("hello");
    } else console.log("No");
  } catch (err) {
    logger.error(err + "");
    throw new Error("invalid Token");
  }
};

module.exports = { verify, validateApple };
