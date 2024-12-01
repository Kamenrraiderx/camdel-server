const express = require('express');
const router = express.Router()
const {login,validSession} = require("../controllers/auth.js");



router.post('/login',login);
router.get('/valid-session',validSession);

module.exports = router