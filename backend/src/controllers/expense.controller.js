const prisma = require('../utils/prismaClient');
const { simplifyDebts } = require('../services/balance.service');

// @desc    Add expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res) => {
    const { description, amount, date, payerId, groupId, splitType, splits } = req.body;
    // splits: [{ participantId, amount }]

    try {
        const group = await prisma.group.findUnique({
            where: { id: parseInt(groupId) },
        });

        if (!group) return res.status(404).json({ message: 'Group not found' });
        if (group.ownerId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        // Validation
        const totalSplit = splits.reduce((acc, curr) => acc + curr.amount, 0);
        // Allow slight float error
        if (Math.abs(totalSplit - amount) > 0.02) {
            return res.status(400).json({ message: 'Split amounts do not match total' });
        }

        const expense = await prisma.expense.create({
            data: {
                description,
                amount,
                date: new Date(date),
                payerId: parseInt(payerId),
                groupId: parseInt(groupId),
                splitType,
                splits: {
                    create: splits.map(s => ({
                        participantId: s.participantId,
                        amount: s.amount
                    }))
                }
            },
            include: {
                splits: true
            }
        });

        res.status(201).json(expense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Group Expenses
// @route   GET /api/groups/:groupId/expenses
// @access  Private
const getGroupExpenses = async (req, res) => {
    const { groupId } = req.params;

    try {
        const expenses = await prisma.expense.findMany({
            where: { groupId: parseInt(groupId) },
            include: {
                splits: { include: { participant: true } },
                payer: true
            },
            orderBy: { date: 'desc' }
        });

        res.json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Group Balance
// @route   GET /api/groups/:groupId/balance
// @access  Private
const getGroupBalance = async (req, res) => {
    const { groupId } = req.params;

    try {
        const expenses = await prisma.expense.findMany({
            where: { groupId: parseInt(groupId) },
            include: {
                splits: true,
            }
        });

        const participants = await prisma.participant.findMany({
            where: { groupId: parseInt(groupId) },
        });

        // Calculate Net Balances
        const netBalances = {}; // { participantId: amount }
        participants.forEach(p => netBalances[p.id] = 0);

        expenses.forEach(exp => {
            // Payer gets credit (+)
            const payerId = exp.payerId;
            const amount = exp.amount;

            if (netBalances[payerId] !== undefined) {
                netBalances[payerId] += amount;
            }

            // Splits get debit (-)
            exp.splits.forEach(split => {
                if (netBalances[split.participantId] !== undefined) {
                    netBalances[split.participantId] -= split.amount;
                }
            });
        });

        const settlements = simplifyDebts(netBalances);

        res.json({
            balances: netBalances,
            settlements
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.expense.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = {
    addExpense,
    getGroupExpenses,
    getGroupBalance,
    deleteExpense
};
