const express = require('express');
const router = express.Router()
const sendGuide = require("../controllers/sendGuides.js");
const validateUUID = require('../middlewares/validateUUID.js')


router.post('/sendGuide/:uuid',validateUUID,sendGuide);

module.exports = router