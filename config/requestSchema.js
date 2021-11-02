const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
exports.createUserSchema = Joi.object({
  username: Joi.string().alphanum().min(5).max(20).required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  outreach: Joi.string(),
});
exports.consumePowerupSchema = Joi.object({
  roomId: Joi.objectId().required(),
  powerupId: Joi.objectId().required(),
});
exports.getLeaderboardSchema = Joi.object({
  query: Joi.string().default(""),
  page: Joi.number().default(1).min(1),
  perPage: Joi.number().default(2).min(0),
});
exports.getQuestionSchema = Joi.object({
  roomId: Joi.objectId().required(),
});
exports.useHintSchema = Joi.object({
  roomId: Joi.objectId().required()
});
exports.getStorySchema = Joi.object({
  roomId: Joi.objectId().required(),
});
exports.getFeedbackSchema = Joi.object({
  text: Joi.string()
});
