const express = require("express");
const router = express.Router();
const { AuthController } = require("../../controllers/index");
const { verifyRefreshToken } = require("../../middlewares");

// const { Joi, celebrate, Segments } = require("celebrate");
const {
  validate,
  Joi,
  Segments,
  celebrate,
} = require("../../utils/validations");
const nickname = Joi.string()
  .max(16)
  // .alphanum()
  .pattern(/^[a-zA-Z0-9\_]{3,16}$/)
  .message(
    '"nickname" must be 3~16 alphanumeric characters and not contain special characters including whitespace'
  )
  .required();
const email = Joi.string().max(30).email().required();
const password = Joi.string()
  .max(15)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,15})/)
  .message(
    '"password" must contain a number, lowercase, UPPERCASE, special, and be 8~15 characters long'
  )
  .required();

// TODO: change tests to incorporate email verification
router.post(
  "/register",
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
  "/login",
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
router.post(
  "/resend-verification-email",
  celebrate({ [Segments.BODY]: Joi.object().keys({ email }) }),
  AuthController.postResendEmail
);

// http://host/api/auth/verify/:verifyingHash
router.get(
  "/verify-account/:userID/:verifyingHash",
  // celebrate({ [Segments.BODY]: Joi.object().keys({}) }),
  validate(Segments.PARAMS, {
    userID: Joi.string().alphanum().required(),
    verifyingHash: Joi.string().hex().required(),
  }),
  AuthController.getVerify
);

// router.use(verifyRefreshToken);
// refreshToken
router.post("/logout", verifyRefreshToken, AuthController.postLogout);

// refreshToken
router.post("/token", verifyRefreshToken, AuthController.postToken);

module.exports = router;
