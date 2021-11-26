const answerLog = require("../models/answerlogModel");

exports.getLogs = async (req, res) => {
  try {
    if (!req.query.key) throw new Error("auth");
    if (!(req.query.key === process.env.IEEE_LOG_KEY)) throw new Error("auth");
    let query = {};
    if (req.query.username) query["username"] = req.query.username;
    if (req.query.check) query["check"] = req.query.check;

    const logs = await answerLog.find(query).sort({ createdAt: -1 }).limit(100);

    res.json(logs);
  } catch (err) {
    res.send("fail");
  }
};
