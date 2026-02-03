const prisma = require('../utils/prismaClient');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
    const { name } = req.body;

    try {
        const group = await prisma.group.create({
            data: {
                name,
                ownerId: req.user.id,
            },
        });

        // Automatically add owner as a participant? 
        // Usually in splitwise, owner is part of the group. 
        // Requirement says: "Group has max 3 participants + owner".
        // Does this mean owner is NOT a participant? Or owner is a participant + 3 others?
        // "Participants" model has name and groupId. 
        // If we want the User (Owner) to be involved in expenses, they probably need a Participant entry 
        // linked to them, or we treat "Participants" as just names.
        // The requirement says "Participant: id, name, color, groupId". It does NOT link to User.
        // So "Participants" are likely virtual/aliases within the group, OR we just use names.
        // However, "Payer" in Expense is a User (payerId -> User).
        // This is a bit conflicting.
        // "Expense: payerId (User), groupId".
        // "ExpenseSplit: participantId (Participant)".
        // So one side is User, one side is Participant.
        // If the payer is the Owner (User), how do they get split?
        // To resolve this cleanly specifically for this schema:
        // We should probably create a Participant entry for the Owner when the group is created,
        // so they can be selected in splits.

        const ownerParticipant = await prisma.participant.create({
            data: {
                name: req.user.name || req.user.email,
                groupId: group.id,
                color: '#3B82F6' // Default Blue
            }
        });

        res.status(201).json({ ...group, participants: [ownerParticipant] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user groups
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res) => {
    try {
        const groups = await prisma.group.findMany({
            where: {
                ownerId: req.user.id,
            },
            include: {
                participants: true,
            }
        });
        res.json(groups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private
const deleteGroup = async (req, res) => {
    const { id } = req.params;

    try {
        const group = await prisma.group.findUnique({
            where: { id: parseInt(id) },
        });

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (group.ownerId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await prisma.group.delete({
            where: { id: parseInt(id) },
        });

        res.json({ message: 'Group removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private
const updateGroup = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const group = await prisma.group.findUnique({
            where: { id: parseInt(id) },
        });

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (group.ownerId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updatedGroup = await prisma.group.update({
            where: { id: parseInt(id) },
            data: { name },
        });

        res.json(updatedGroup);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createGroup,
    getGroups,
    deleteGroup,
    updateGroup,
};
