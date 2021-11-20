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

  let data;
  if (currentTime < eventStartTime) {
    data = {
      enigmaStarted: false,
      enigmaEnded: false,
      date: Math.floor(moment.duration(eventStartTime.diff(currentTime))._milliseconds / 1000)
    }
  }
  else if (currentTime > eventStartTime && currentTime < eventEndTime) {
    data = {
      enigmaStarted: true,
      enigmaEnded: false,
      date: Math.floor(moment.duration(eventEndTime.diff(currentTime))._milliseconds / 1000)
    }
  }
  else {
    data = {
      enigmaStarted: true,
      enigmaEnded: true,
      date: Math.floor(moment.duration(eventEndTime.diff(currentTime))._milliseconds / 1000)
    }
  }
  return data;
};
module.exports = getTimer;
