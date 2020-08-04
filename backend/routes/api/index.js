const router = require('express').Router();

router.use('/auth', require('./route-auth'));
router.use('/friends', require('./route-friend'));
// router.use('/', require('./'));
// router.use('/', require('./'));
// router.use('/', require('./'));
// router.use('/', require('./'));

module.exports = router;
