const router = require('express').Router();

router.use('/auth', require('./route-auth'));
// router.use('/relations', require('./route-relations'));
// router.use('/', require('./'));
// router.use('/', require('./'));
// router.use('/', require('./'));
// router.use('/', require('./'));

module.exports = router;
