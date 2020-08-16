const router = require('express').Router();

router.use('/auth', require('./route-auth'));
router.use('/followers', require('./route-follower'));
// router.use('/', require('./'));
// router.use('/', require('./'));
// router.use('/', require('./'));
// router.use('/', require('./'));

module.exports = router;
