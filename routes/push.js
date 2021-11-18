const express = require("express");
const router = express.Router();

var admin = require("firebase-admin");
var User = require("../models/userModel");
var serviceAccount = {
  type: "service_account",
  project_id: "enigma-8",
  private_key_id: "277b4714ec0a8b4c549e98fde0ccfe6577bc1c68",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC7VIMyjKBNJfiI\nAx8JTZX0YuoQ7Vab+yWNxFplFr4rShgXgFeH3vQrlCQz8kDDaD/vBi2rLcStDs0l\nORo+uXod2weu+HNVZXlGGydiFIrDcIVE3Lj8GACKn2963rHnPdfwqGwoqXOeIPbF\nwoaXX5fwiQpSh/VEzAzFEzj8V7VCew4cBv57Kb3nYhgtazStXPv0oyApz3Ukt1wO\n2mS1clJFW/g1JRn93kaLKshScDEhS7rE8OaA8TwSpLAuK5rkYejTdSb9XEb4F7ak\nkP0mgsXpE2jmBUCWS2LWTPtfLzfsLDmuYPJN7iWHRTaNSRyk9H9o/ZmLxqbYfPln\nXzPPnAdtAgMBAAECggEADJF9/+05cBOlGhMDiQ9AiVX9mEckMXDnMxzCZ9ffyG2/\nMgx1UvNddHMK/sU5HSMobvP+Kmb2tBmzH9U18pFlJQ2l9VJMAqW9PjviJ41zReuN\ntXINozRFDQfnZdn9G6OlkkrqfsvnqutRQzFq8EsEmanIHINsrEH4dVx1zVBhI+Wa\nOrbsOkgXntTHnu05jf3NDXt7P3tUtl55NXJxPxPztXYpdfoLjMWmvkXB2n0fSQhg\nAfShqg5KY4/nCMgMXHNUfdgeChgNzOzmGdwoHM2RrKbEU7V6+6IhBiVKG6PTl1bv\ncwMriD4jHLthpq0Xv9biPvp54V3Cu15ZLM4+NvgcjQKBgQDo9RVq+tWkG0SHI6iK\nUWIkYa3zNB/WPc+mtv0Jx3WP2JfKSjFNeOkS2+QyrN/8w+yHPrUDltL7NIzVRGKE\nzoV1lvhZbs4tHSARJZXw+mZFIXS/MLl9/2OYRKJXeGn2jV+yYYvEBZVb4csaLPgk\n2MvPUPkoOP3RO74SGYwhhupRlwKBgQDN3A/az4yjuoJhQV72U2aMoGAz1P1zmkZX\nyS8dtWJtOQPR63JmaNM6jyqhgnUHO+oOpqBIS9/uM5qHF7erc+gn8hpqVcieqOoU\nTjv3VNOj399ZKP5JBC5CX3YcEyOedPNf4x/nz3+K5CcfdWhKPjx6a+5EvCDNKaMZ\nqBoK0bqHmwKBgAavqhq08lbQdYoPavH1XgS/TPfTAirrAT++tsqGEAi95bVnpbyc\ngMwKxaTys0cU9H/5O8bLmGifXH9uhAldyBTU7XHbrU08LcRwOLp+5VqMmEY4hspn\n/xrKtYIfMaNi8WE0TYelxWCqvWKV8dVU55yerVgLMrXDqjPoyc3YincnAoGAXQSb\n0WZJCU5kTWfJbgp/YvmwnpsWLx89u7r3ZDgqkmnZ1QfLeITTNTmtrK8TDELBXv9h\nm2lVdP+ySmqoHnvQIgSedP/wF+kBZE15gSe+PeURuerxA7M0597UspjfVmFH+0LY\njtlOq0aueuOFTU7T6wlL75kGRU4UGarAobTk0RMCgYB2u5X94lHrL2kGzvRG9CNH\nPOG7Mz2Bc/64BcmFRvaW2pgkMBeECR9S/gcRqiVcAqDbjM/MfBz1cznjK/hVjTKs\nOYYVtCw2Qryhp99pxQRVfgCx5M4TVghTblaPkYhqHEy502IPA2qeXiEZxtyqDuiA\nTXFi5hCJk62bf153BFIk4g==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-98vno@enigma-8.iam.gserviceaccount.com",
  client_id: "116391387014888769632",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-98vno%40enigma-8.iam.gserviceaccount.com",
};

router.post("/all", async (req, res) => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  const messaging = admin.messaging();
  const ffcm = await User.find({ fcmToken: { $ne: [] } });

  const fcm = ffcm.map(({ fcmToken }) => fcmToken);
  console.log(fcm);

  const fffcm = [];
  for (var a in fcm) {
    if (fcm[a]) {
      console.log(fcm[a]);
      fffcm.push(...fcm[a]);
    }
  }

  console.log(fffcm);
  const registrationTokens = fcm;

  const message = {
    notification: {
      title: "This is a Notification",
      body: "This is the body of the notification message.",
    },
    tokens: registrationTokens,
  };

  messaging.sendMulticast(message).then((response) => {
    console.log(response.successCount + " messages were sent successfully");
  });
  res.send("");
});

module.exports = router;
