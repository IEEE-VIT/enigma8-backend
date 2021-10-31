const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
exports.createUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  isCollegeStudent: Joi.boolean().required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  outreach: Joi.string(),
});



exports.getQuestionSchema = Joi.object({
  roomId: Joi.objectId().required()
});

exports.consumePowerupSchema = Joi.object({
  roomId: Joi.objectId().required(),
  powerupId: Joi.objectId().required(),
});

