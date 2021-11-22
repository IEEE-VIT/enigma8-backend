const moment = require("moment-timezone");
const { response } = require("../config/responseSchema");

const isEnigmaActive = (req, res, next) => {
  const eventStartTime = moment.tz(
    Date.parse(process.env.APP_ENIGMA_START_TIME),
    "Asia/Calcutta"
  );

  const eventEndTime = moment.tz(
    Date.parse(process.env.APP_ENIGMA_END_TIME),
    "Asia/Calcutta"
  );
  const currentTime = moment.tz("Asia/Calcutta");

  const enigmaStarted = currentTime > eventStartTime ? true : false;
  const enigmaEnded = currentTime > eventEndTime ? true : false;

  if (!enigmaStarted && !enigmaEnded) {
    response(res, {}, 401, "Enigma hasn't started yet", false);
    return;
  }
  if (enigmaEnded && enigmaStarted) {
    response(res, {}, 401, "Enigma has ended", false);
    return;
  }
  next();
};
module.exports = isEnigmaActive;
