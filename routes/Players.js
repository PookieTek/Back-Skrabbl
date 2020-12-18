const express = require('express');
const router = express.Router();
const playerController = require('../controllers/Players');
const auth = require('../middleware/auth');

router.post('/play', auth, playerController.play);
router.post('getscore', auth, playerController.getScore);
module.exports = router;