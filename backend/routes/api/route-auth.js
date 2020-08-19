const express = require('express');
const router = express.Router();
const { AuthController } = require('../../controllers/index');
const { verifyAccessToken, verifyRefreshToken } = require('../../middlewares');

const { Joi, celebrate, Segments } = require('celebrate');

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

// TODO: add email verification
router.post(
	'/register',
	celebrate(
		{
			[Segments.BODY]: Joi.object().keys({
				nickname,
				email,
				password,
			}),
		},
		{ abortEarly: false }
	),
	AuthController.postRegister
);

// email pass
router.post(
	'/login',
	celebrate(
		{
			[Segments.BODY]: Joi.object().keys({
				email,
				password,
			}),
		},
		{ abortEarly: false }
	),
	AuthController.postLogin
);

router.use(verifyRefreshToken);
// refreshToken
router.post('/logout', AuthController.postLogout);

// refreshToken
router.post('/token', AuthController.postToken);

module.exports = router;
