const express = require('express');
const router = express.Router();
const dicoController = require('../controllers/Dico');
const auth = require('../middleware/auth');

router.get('/searchword', auth, dicoController.checkWord);

module.exports = router;