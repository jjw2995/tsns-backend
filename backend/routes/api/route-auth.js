const express = require("express");
const router = express.Router();
const { AuthController } = require("../../controllers/index");
const { verifyRefreshToken } = require("../../middlewares/token-verify");

const authController = new AuthController();
// const { Joi, celebrate, Segments } = require("celebrate");
const {
  validate,
  Joi,
  Segments,
  celebrate,
} = require("../../utils/validations");
const nickname = Joi.string()
  // .alphanum()
  .pattern(/^[a-zA-Z0-9\_]{3,16}$/)
  .message(
    '"nickname" must be 3~16 alphanumeric characters and not contain special characters including whitespace'
  )
  .required();
const email = Joi.string().max(30).email().required();
const password = Joi.string()
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,32})/)
  .message(
    '"password" must contain a number, lowercase, UPPERCASE, special, and be 8~32 characters long'
  )
  .required();

// TODO: change tests to incorporate email verification
router.post(
  "/register",
  celebrate(
    {
      [Segments.BODY]: Joi.object()
        .keys({
          nickname,
          email,
          password,
        })
        .unknown(true),
    },
    { abortEarly: false }
  ),
  authController.postRegister
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
  authController.postLogin
);

router.post(
  "/resend-verification-email",
  celebrate({ [Segments.BODY]: Joi.object().keys({ email }) }),
  authController.postResendEmail
);

router.get(
  "/verify-account/:userID/:verifyingHash",
  validate(Segments.PARAMS, {
    userID: Joi.string().alphanum().required(),
    verifyingHash: Joi.string().hex().required(),
  }),
  authController.getVerify
);
router.post(
  "/reset-password",
  validate(Segments.BODY, {
    email,
  }),
  authController.postSetupPassReset
);

router.post(
  "/set-new-password",
  validate(Segments.BODY, {
    userID: Joi.string().alphanum().required(),
    resetPassHash: Joi.string().hex().required(),
    password,
  }),
  authController.postResetPassword
);

router.use(verifyRefreshToken);
// refreshToken
router.post("/logout", authController.postLogout);

// refreshToken
router.post("/token", authController.postToken);

module.exports = router;
