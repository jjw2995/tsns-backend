const router = require("express").Router();
const { verifyAccessToken } = require("../../middlewares");

router.use("/auth", require("./route-auth"));

router.use(verifyAccessToken);
router.use("/", require("./route-follower"));
// router.use("/followers", require("./route-follower")); ???
// router.use("/followees", require("./route-followee")); ???
router.use("/posts", require("./route-post"));
router.use("/comments", require("./route-comment"));
router.use("/users", require("./route-user"));

module.exports = router;
