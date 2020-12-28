const express = require("express");
const router = express.Router();
const { AuthController } = require("../../controllers/index");
const { verifyRefreshToken } = require("../../middlewares/token-verify");

// const { Joi, celebrate, Segments } = require("celebrate");
const {
  validate,
  Joi,
  Segments,
  celebrate,
  val,
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
  // val({ nickname, email, password }, Segments.BODY),
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

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
router.post(
  "/resend-verification-email",
  celebrate({ [Segments.BODY]: Joi.object().keys({ email }) }),
  AuthController.postResendEmail
);

router.get(
  "/verify-account/:userID/:verifyingHash",
  validate(Segments.PARAMS, {
    userID: Joi.string().alphanum().required(),
    verifyingHash: Joi.string().hex().required(),
  }),
  AuthController.getVerify
);

// router.post("/reset-password");
// router.post("/new-password/:uid")
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

router.use(verifyRefreshToken);
// refreshToken
router.post("/logout", AuthController.postLogout);

// refreshToken
router.post("/token", AuthController.postToken);

module.exports = router;
