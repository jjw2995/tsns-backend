const express = require('express');
const router = express.Router();
const { UserController } = require('../../controllers/index');
// const { Joi, celebrate, Segments } = require('celebrate');

let userController = new UserController();

/**			api/followers
 */

router.post('/private', userController.postPrivate);

module.exports = router;
