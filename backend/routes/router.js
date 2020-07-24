const router = require('express').Router();
const {} = require('./api')

// router.use('/api/', require('./api/'));
router.use('/api', require('./api/index'));


module.exports = router;