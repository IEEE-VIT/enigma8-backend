var admin = require("firebase-admin");

var serviceAccount = {};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const messaging = admin.messaging();

// var payload =
//     {
//         notification:
//         {
//             title: "This is a Notification",
//             body: "This is the body of the notification message."
//         },
//         topic: 'topic'
//     };

// messaging.send(payload)
//     .then((result) => {
//         console.log(result)
//     })

const registrationTokens = [
  "dTbQWaxCS56IlBHA6Kb5lQ:APA91bEznhcos9bkw41x70p3UjoPNYH-l4alpb1nY7AcxLMRPyhd9X8D4CQY0kHQokFuOnTlUBjBjtPM-wrk9yQDoNC4-eoZz7w2T3bdAJz4ChqXky2LiJIgRRcnHNqmg5bnWzYVgk5S",
  // …
  "f9mwORbFT3iM25W9tOoyAc:APA91bG8OSZ9Z32d_sxB7T6Vju1qI6iVOrzFemZo7PRABVelxYzr-lq_q6DuNBGjrVVnEiqgIVDolLyyNkkWIAAxnCWMIfD0f3WTNqpBH717Hay66tbYxHX3hztEQBm4pf3rU7I39rjy",
];

const message = {
  data: { score: "850", time: "2:45" },
  notification: {
    title: "This is a Notification",
    body: "This is the body of the notification message.",
  },
  tokens: registrationTokens,
};

messaging.sendMulticast(message).then((response) => {
  console.log(response.successCount + " messages were sent successfully");
});
