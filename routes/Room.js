const express = require('express');
const router = express.Router();
const roomController = require('../controllers/Room');
const auth = require('../middleware/auth');

router.post('/create', roomController.createRoom);
router.post('/config', auth, roomController.configRoom);
router.post('/join', auth, roomController.joinRoom);
router.post('/add', roomController.addPlayer);
router.post('/remove', auth, roomController.removePlayer);
router.get('/get', auth, roomController.getRoom);
router.post('/start', auth, roomController.startGame);
router.post('/def', auth, roomController.getDefinition);

module.exports = router;