import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const GroupDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [groupData, setGroupData] = useState(null); // includes participants from listing
    const [expenses, setExpenses] = useState([]);
    const [balances, setBalances] = useState({});
    const [settlements, setSettlements] = useState([]);
    const [participants, setParticipants] = useState([]);

    // Forms
    const [newParticipant, setNewParticipant] = useState('');
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [expenseForm, setExpenseForm] = useState({
        description: '',
        amount: '',
        payerId: '',
        splitType: 'equal' // Default
    });

    const fetchData = async () => {
        try {
            // Fetch Expenses
            const expRes = await axios.get(`/expenses/group/${id}`);
            setExpenses(expRes.data);

            // Fetch Balance
            const balRes = await axios.get(`/expenses/group/${id}/balance`);
            setBalances(balRes.data.balances);
            setSettlements(balRes.data.settlements);

            // We also need participants. We can get them from the group list or a specific endpoint.
            // Since we don't have a direct "get single group" endpoint that returns everything,
            // I'll rely on the "getGroups" if I had it, but standard REST would suggest /groups/:id.
            // I didn't implement GET /groups/:id explicitly in the backend controller earlier!
            // I implemented GET /groups (list).
            // I should update the backend or just loop through the list if I already had it.
            // But fetching freshly is better.
            // Let's TRY to fetch the group list and find it, OR add GET /groups/:id backend support.
            // I'll assume I can just fetch the group list and filter for now to save time,
            // OR I can quickly patch the backend. 
            // Actually, I'll allow "fetching all groups" and filtering here as a fallback.
            const groupsRes = await axios.get('/groups');
            const thisGroup = groupsRes.data.find(g => g.id === parseInt(id));
            if (thisGroup) {
                setGroupData(thisGroup);
                setParticipants(thisGroup.participants);
                // Default payer to first participant
                if (thisGroup.participants.length > 0) {
                    setExpenseForm(prev => ({ ...prev, payerId: thisGroup.participants[0].id }));
                }
            } else {
                // Handle not found
                // navigate('/');
            }

        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleAddParticipant = async (e) => {
        e.preventDefault();
        if (!newParticipant) return;
        try {
            await axios.post('/participants', {
                name: newParticipant,
                groupId: id,
                color: '#10B981'
            });
            setNewParticipant('');
            fetchData(); // Refresh to get new participant list
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error adding participant');
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        // Calculate splits based on 'equal' for now
        if (!participants.length) return;

        const amount = parseFloat(expenseForm.amount);
        if (isNaN(amount) || amount <= 0) return;

        // Equal split logic
        const splitAmount = amount / participants.length;
        const splits = participants.map(p => ({
            participantId: p.id,
            amount: parseFloat(splitAmount.toFixed(2))
        }));

        // Fix rounding error on the last person
        const totalCalculated = splits.reduce((acc, curr) => acc + curr.amount, 0);
        const diff = amount - totalCalculated;
        if (Math.abs(diff) > 0.001) {
            splits[0].amount += diff; // dump rounding error on first person
        }

        try {
            await axios.post('/expenses', {
                description: expenseForm.description,
                amount,
                payerId: expenseForm.payerId,
                groupId: id,
                splitType: 'equal',
                date: new Date(),
                splits
            });
            setExpenseForm({ description: '', amount: '', payerId: participants[0]?.id, splitType: 'equal' });
            setShowExpenseForm(false);
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Error creating expense');
        }
    };

    const deleteExpense = async (expenseId) => {
        if (!window.confirm('Delete this expense?')) return;
        try {
            await axios.delete(`/expenses/${expenseId}`);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const deleteGroup = async () => {
        if (!window.confirm('Delete this group? This cannot be undone.')) return;
        try {
            await axios.delete(`/groups/${id}`);
            navigate('/');
        } catch (err) {
            alert('Cannot delete group');
        }
    }

    if (!groupData) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">{groupData.name}</h1>
                    <button
                        onClick={deleteGroup}
                        className="text-red-500 text-sm hover:underline"
                    >
                        Delete Group
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Main Content: Expenses */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Add Expense Button */}
                        <div className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Expenses</h2>
                            <button
                                onClick={() => setShowExpenseForm(!showExpenseForm)}
                                className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-green-600"
                            >
                                {showExpenseForm ? 'Cancel' : 'Add Expense'}
                            </button>
                        </div>

                        {/* Add Expense Form */}
                        {showExpenseForm && (
                            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-primary">
                                <h3 className="text-lg font-bold mb-4">New Expense</h3>
                                <form onSubmit={handleAddExpense} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <input
                                            type="text"
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                            value={expenseForm.description}
                                            onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                                value={expenseForm.amount}
                                                onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Paid By</label>
                                            <select
                                                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                                value={expenseForm.payerId}
                                                onChange={e => setExpenseForm({ ...expenseForm, payerId: e.target.value })}
                                            >
                                                {participants.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Currently supporting <strong>Equal Split</strong> only.
                                    </div>
                                    <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-green-600">Save Expense</button>
                                </form>
                            </div>
                        )}

                        {/* Expense List */}
                        <div className="space-y-4">
                            {expenses.map(exp => (
                                <div key={exp.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-blue-100 text-blue-800 font-bold p-3 rounded-full text-xs flex flex-col items-center w-16">
                                            <span>{new Date(exp.date).getDate()}</span>
                                            <span className="text-[10px] uppercase">{new Date(exp.date).toLocaleString('default', { month: 'short' })}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{exp.description}</p>
                                            <p className="text-sm text-gray-500">
                                                {exp.payer?.name} paid ${exp.amount}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-primary">
                                            {/* You lent / You borrowed logic could go here */}
                                        </p>
                                        <button onClick={() => deleteExpense(exp.id)} className="text-red-400 text-xs hover:text-red-600">Delete</button>
                                    </div>
                                </div>
                            ))}
                            {expenses.length === 0 && <p className="text-center text-gray-500 py-4">No expenses recorded.</p>}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">

                        {/* Balances / Settlements */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Balances</h2>
                            {/* Simplify: Show who owes whom */}
                            {settlements.length > 0 ? (
                                <ul className="space-y-3">
                                    {settlements.map((s, idx) => {
                                        const fromName = participants.find(p => p.id === s.from)?.name || 'Unknown';
                                        const toName = participants.find(p => p.id === s.to)?.name || 'Unknown';
                                        return (
                                            <li key={idx} className="flex items-center text-sm">
                                                <span className="font-semibold text-red-500">{fromName}</span>
                                                <span className="px-2 text-gray-400">owes</span>
                                                <span className="font-semibold text-green-500">{toName}</span>
                                                <span className="bg-gray-100 ml-auto px-2 py-1 rounded font-bold">${s.amount}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-sm">Everyone is settled up!</p>
                            )}
                        </div>

                        {/* Participants */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Participants</h2>
                            <ul className="space-y-2 mb-4">
                                {participants.map(p => (
                                    <li key={p.id} className="flex items-center justify-between text-gray-700 bg-gray-50 p-2 rounded">
                                        <span>{p.name}</span>
                                    </li>
                                ))}
                            </ul>

                            <form onSubmit={handleAddParticipant} className="mt-4">
                                <input
                                    type="text"
                                    placeholder="Add person..."
                                    className="w-full border border-gray-300 rounded p-2 text-sm mb-2"
                                    value={newParticipant}
                                    onChange={e => setNewParticipant(e.target.value)}
                                />
                                <button type="submit" className="w-full bg-gray-800 text-white py-1 rounded text-sm hover:bg-black">Add</button>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupDetails;
