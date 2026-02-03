const express = require('express');
const router = express.Router();
const { addExpense, getGroupExpenses, getGroupBalance, deleteExpense } = require('../controllers/expense.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/', protect, addExpense);
router.delete('/:id', protect, deleteExpense);
router.get('/group/:groupId', protect, getGroupExpenses);
router.get('/group/:groupId/balance', protect, getGroupBalance);

module.exports = router;
