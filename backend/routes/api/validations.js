const { Joi, Segments, celebrate } = require('celebrate');

// module.exports = class
const nickname = Joi.string()
	.pattern(/^[a-zA-Z0-9 ]{3,16}$/)
	.message(
		'"nickname" must be 3~16 characters long and not contain special characters'
	)
	.required();
const email = Joi.string().email().required();
const password = Joi.string()
	.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/)
	.message(
		'"password" must contain a number, lowercase, UPPERCASE, special, and be 8 characters long'
	)
	.required();

module.exports = class Validate {
	constructor() {}
	Body() {
		return celebrate({
			[Segments.BODY]: Joi.object().keys({
				nickname,
				email,
				password,
			}),
		});
	}
};

// module.exports = {
// 	nickname,
// 	email,
// 	password,
// };
