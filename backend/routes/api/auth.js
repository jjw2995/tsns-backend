const express = require('express')
const router = express.Router()
const {authController} = require('../../controllers/index')

router.get('/', authController.getRegister)

router.post('/register',authController.postRegister)
    // call service layer

module.exports = router;