const express = require('express');
const router = express.Router();
const { PostController } = require('../../controllers/index');
const { verifyAccessToken } = require('../../middlewares');

router.use(verifyAccessToken);

let postController = new PostController();

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
router.post('/', postController.post);

/**
 * body{
 * _id
 * }
 */
router.delete('/', postController.delete);

/**
 * body {
 * _id <post _id>
 * desription
 * }
 */
router.patch('/', postController.patch);

// let limit = req.query.limit ???
router.get('/', postController.get);

// let limit = req.query.limit ???
router.get('/explore', postController.getExplore);

module.exports = router;
