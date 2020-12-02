const router = require("express").Router();
const { verifyAccessToken } = require("../../middlewares");

router.use("/auth", require("./route-auth"));

// router.use(verifyAccessToken);

router.use("/posts", verifyAccessToken, require("./route-post"));
router.use("/comments", verifyAccessToken, require("./route-comment"));
router.use("/users", verifyAccessToken, require("./route-user"));
router.use("/", verifyAccessToken, require("./route-follower"));

module.exports = router;
