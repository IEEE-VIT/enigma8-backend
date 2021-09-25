const Joi = require("joi");
const responseSchema = Joi.object({
  success: Joi.boolean().required(),
  data: Joi.object().required(),
  message: Joi.string().empty(""),
});
exports.response = (
  res,
  data,
  statusCode = 200,
  message = "",
  success = true
) => {
  const { error, value } = responseSchema.validate({ success, data, message });
  if (error) {
    res.status(statusCode).json({
      success: false,
      data: {},
      message: error.details.message[0],
    });
    return;
  }
  res.status(statusCode).json(value);
};
