const express = require('express');
const router = express.Router();
const { CommentController } = require('../../controllers/index');
const { verifyAccessToken } = require('../../middlewares');

router.use(verifyAccessToken);

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
router.post('/', commentController.post);

/**
 * body{
 * _id
 * }
 */
router.delete('/', commentController.delete);

/**
 * body {
 * _id <post _id>
 * }
 */
router.patch('/', commentController.patch);

router.get('/', commentController.get);

// let limit = req.query.limit ???
router.get('/explore', commentController.getExplore);

module.exports = router;
