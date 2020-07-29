const router = require('express').Router();

router.use('/auth', require('./auth-route'));
// router.use('/', require('./'));
// router.use('/', require('./'));
// router.use('/', require('./'));
// router.use('/', require('./'));

module.exports = router;
