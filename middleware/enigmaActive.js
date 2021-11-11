const moment = require("moment-timezone");
const { response } = require("../config/responseSchema");

const isEnigmaActive = (req, res, next) => {
    const eventStartTime = moment.tz(
        Date.parse(process.env.ENIGMA_START_TIME),
        "Asia/Calcutta"
    );

    const eventEndTime = moment.tz(
        Date.parse(process.env.ENIGMA_END_TIME),
        "Asia/Calcutta"
    );
    const currentTime = moment.tz("Asia/Calcutta");

    const enigmaStarted = currentTime < eventStartTime ?  false : true;
     
    if( !enigmaStarted ) {
        response(res, {}, 401, "Enigma hasn't started yet", false);
        return;
    }
    next();
};
module.exports = isEnigmaActive;
