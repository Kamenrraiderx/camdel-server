const express = require('express');
const router = express.Router()
const {createLink,getLinks,deleteLinks,setActive} = require("../controllers/link.js");
const checkSessionToken = require('../middlewares/authorization.js');


router.post('/create-link',checkSessionToken,createLink);
router.get('/get-active-links',checkSessionToken,getLinks);
router.delete('/delete-link/:uuid',checkSessionToken,deleteLinks);
router.put('/update-active/:uuid',checkSessionToken,setActive);

module.exports = router