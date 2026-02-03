const express = require('express');
const router = express.Router();
const { createGroup, getGroups, deleteGroup, updateGroup } = require('../controllers/group.controller');
const { protect } = require('../middlewares/auth.middleware');

router.route('/')
    .post(protect, createGroup)
    .get(protect, getGroups);

router.route('/:id')
    .delete(protect, deleteGroup)
    .put(protect, updateGroup);

module.exports = router;
