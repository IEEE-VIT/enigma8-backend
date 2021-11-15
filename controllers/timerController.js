const moment = require("moment-timezone");
const logger = require("../config/logger");
const getTimer = () => {
  const eventStartTime = moment.tz(
    Date.parse(process.env.ENIGMA_START_TIME),
    "Asia/Calcutta"
  );

  const eventEndTime = moment.tz(
    Date.parse(process.env.ENIGMA_END_TIME),
    "Asia/Calcutta"
  );
  const currentTime = moment.tz("Asia/Calcutta");

  const data =
    currentTime < eventStartTime
      ? {
          enigmaStarted: false,
          date: Math.floor(
            moment.duration(eventStartTime.diff(currentTime))._milliseconds /
              1000
          ),
        }
      : {
          date: Math.floor(
            moment.duration(eventEndTime.diff(currentTime))._milliseconds / 1000
          ),
          enigmaStarted: true,
        };
  return data;
};
module.exports = getTimer;
