const express = require("express");
const router = express.Router();
const { CommentController } = require("../../controllers/index");

const { validate, Segments, Joi } = require("./validations");

let commentController = new CommentController();

/**			api/posts
 */

// for JOI validation

/**
 * body {
 * description
 * media <up to 4 urls>
 * level
 * }
 */
router.post("/", commentController.post);

// /**
//  * body{
//  * _id
//  * }
//  */
// router.delete("/", commentController.delete);

// /**
//  * body {
//  * _id <post _id>
//  * }
//  */
// router.patch("/", commentController.patch);

router.get("/", commentController.get);
router.get("/subcomments/", commentController.getSubcomments);

router.delete("/", commentController.delete);

// router.("/", commentController.);
// router.("/", commentController.);
// router.("/", commentController.);

// // let limit = req.query.limit ???
// router.get("/explore", commentController.getExplore);

module.exports = router;
