const router = require("express").Router();
const { verifyAccessToken } = require("../../middlewares/token-verify");

router.use("/auth", require("./route-auth"));

router.use(verifyAccessToken);

router.use("/posts", require("./route-post"));
router.use("/comments", require("./route-comment"));
router.use("/users", require("./route-user"));
router.use("/", require("./route-follower"));

module.exports = router;
