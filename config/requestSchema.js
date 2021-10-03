const Joi = require("joi");
exports.createUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  isCollegeStudent: Joi.boolean().required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  outreach: Joi.string(),
});
