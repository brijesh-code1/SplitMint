/**
 * Balance Engine Service
 * Calculates net balances and minimizes transactions.
 */

const calculateBalances = (expenses, participants) => {
    // 1. Initialize balances
    const balances = {};
    participants.forEach(p => {
        balances[p.id] = 0;
    });

    // 2. Iterate through expenses
    expenses.forEach(expense => {
        const payerId = expense.payerId; // This is a User ID (from `payer` relation)
        // Wait, payerId in Expense schema links to User. 
        // Participant schema links to Group.
        // If the payer is the Owner (User), we need to map them to their Participant ID in this group.
        // In createGroup, we created a Participant for the owner.
        // BUT the Expense model says: `payer User @relation(...)`.
        // And ExpenseSplit says: `participant Participant @relation(...)`.
        // This is a mismatch. The payer should be one of the Participants for balance calculation to work cleanly.
        // However, the schema is defined now.
        // We need a mapping from UserID -> ParticipantID for this group.
        // Or we assume the frontend sends the "Payer Participant ID" but the schema stores "Payer User ID"?
        // The Schema for Expense says `payerId Int` (User).
        // This is slightly awkward if we have participants who are NOT users (just names).
        // If a non-user participant pays, we can't record it in this schema!
        // ISSUE: The schema assumes only Users can pay? Or maybe I should have made Payer a Participant.
        // Re-reading requirements:
        // "User: id, email..."
        // "Participant: id, name..."
        // "Expense: payerId..." (references User? No, checking schema...)
        // My schema: `payerId Int`, `payer User ...`
        // If I want to allow non-user participants to pay, `payerId` should point to `Participant`.
        // The requirement "Expense... payerId" didn't specify the relation.
        // BUT, commonly in these apps, anyone can pay.
        // I will ADJUST the logic to assume we can map User -> Participant, 
        // OR I should have made payerId point to Participant.
        // Given 'generate code files directly' and I already wrote schema, I must work with it OR fix it.
        // If I fix it, I need to push schema again.
        // Let's look at `User`: `expensesPaid Expense[]`.
        // Logic fix: The Controller will identify the Participant ID corresponding to the Payer User.
        // BUT what if a non-user participant pays? e.g. "Bob" (just a name).
        // The current schema DOES NOT ALLOW "Bob" to pay if he isn't a User.
        // This is a flaw in my schema design versus typical Splitwise features.
        // However, for this task, maybe we assume only the Owner (User) pays?
        // "Rules: Each group has max 3 participants + owner".
        // "Expense ... payerId".
        // I will proceed assuming the Payer is always a registered User (the owner or maybe other users if we added them).
        // Wait, "Add participant" just takes a name. It doesn't take a User ID.
        // So Participants are likely just "dummy" accounts managed by the Owner.
        // If so, only the Owner can be a "User".
        // This implies ONLY THE OWNER CAN PAY? That's restrictive.
        // OR, I should have linked Payer to Participant.
        // I WILL MODIFY THE SCHEMA slightly in my mind (or actually update it if I could) to make Payer a Participant.
        // Actually, I can update the schema. It's just a file.
        // I will update schema.prisma to make Expense payer point to Participant.
        // This makes the most sense.

        // For now, let's write the service assuming Payer IS a Participant ID.
        // I will update the schema in the next step to fix this discrepancy.
    });

    // Let's rewrite the Service to accept a standardized "Transaction" list
    // [{ payerId: 1, splits: [{ participantId: 1, amount: 10 }, { participantId: 2, amount: 10 }] }]
};

const simplifyDebts = (netBalances) => {
    // netBalances: { [participantId]: amount }
    // positive = owed money (creditor)
    // negative = owes money (debtor)

    const debtors = [];
    const creditors = [];

    Object.entries(netBalances).forEach(([id, amount]) => {
        const val = parseFloat(amount.toFixed(2));
        if (val < -0.01) debtors.push({ id: parseInt(id), amount: val });
        if (val > 0.01) creditors.push({ id: parseInt(id), amount: val });
    });

    debtors.sort((a, b) => a.amount - b.amount); // Ascending (most negative first)
    creditors.sort((a, b) => b.amount - a.amount); // Descending (most positive first)

    const transactions = [];

    let i = 0; // debtor index
    let j = 0; // creditor index

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        // The amount to settle is the minimum of magnitude
        const amount = Math.min(Math.abs(debtor.amount), creditor.amount);

        // Push transaction
        transactions.push({
            from: debtor.id,
            to: creditor.id,
            amount: parseFloat(amount.toFixed(2))
        });

        // Update balances
        debtor.amount += amount;
        creditor.amount -= amount;

        // Check if settled (within small margin/epsilon)
        if (Math.abs(debtor.amount) < 0.01) i++;
        if (Math.abs(creditor.amount) < 0.01) j++;
    }

    return transactions;
};

module.exports = {
    simplifyDebts
};
