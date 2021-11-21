const express = require("express");
const router = express.Router();

var admin = require("firebase-admin");
var User = require("../models/userModel");

var serviceAccount = {
  type: "service_account",
  project_id: "enigma-8",
  private_key_id: process.env.ORACLE_PRIV_KEY_ID,
  private_key: process.env.ORACLE_PRIV_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.ORACLE_CLIENT_EMAIL,
  client_id: process.env.ORACLE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.ORACLE_CERT,
};
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const messaging = admin.messaging();
router.get("/all", async (req, res) => {
  if (req.query.key !== process.env.ORACLE) {
    res.status(500).send("fail");
    return;
  }

  const user = await User.find({ fcmToken: { $ne: [] } });

  const token = user.map(({ fcmToken }) => fcmToken);

  const fcm = [];
  for (var a in token) {
    if (token[a]) {
      fcm.push(...token[a]);
    }
  }

  const registrationTokens = fcm.map(({ token }) => token);
  const message = {
    notification: {
      title: req.query.title,
      body: req.query.body,
    },
    tokens: registrationTokens,
  };

  messaging.sendMulticast(message).then((response) => {
    res.status(200).json({ status: "success", response });
  });
});

module.exports = router;
