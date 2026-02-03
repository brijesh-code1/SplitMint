const express = require('express');
const router = express.Router();
const { addParticipant, removeParticipant } = require('../controllers/participant.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/', protect, addParticipant);
router.delete('/:id', protect, removeParticipant);

module.exports = router;
