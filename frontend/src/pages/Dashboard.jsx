import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Dashboard = () => {
    const [groups, setGroups] = useState([]);
    const [newGroupName, setNewGroupName] = useState('');

    const fetchGroups = async () => {
        try {
            const { data } = await axios.get('/groups');
            setGroups(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const createGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName) return;
        try {
            await axios.post('/groups', { name: newGroupName });
            setNewGroupName('');
            fetchGroups();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

                {/* Create Group */}
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h2 className="text-xl font-semibold mb-4">Create New Group</h2>
                    <form onSubmit={createGroup} className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Group Name"
                            className="flex-1 border border-gray-300 rounded-md p-2"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                        />
                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-green-600">
                            Create
                        </button>
                    </form>
                </div>

                {/* Groups List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => (
                        <Link to={`/groups/${group.id}`} key={group.id} className="block">
                            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
                                <h3 className="text-xl font-bold text-gray-800">{group.name}</h3>
                                <p className="text-gray-500 mt-2">{group.participants?.length || 0} participants</p>
                                <div className="mt-4 text-blue-500 hover:underline">View Expenses &rarr;</div>
                            </div>
                        </Link>
                    ))}
                    {groups.length === 0 && (
                        <p className="text-gray-500 col-span-full text-center py-8">No groups yet. Create one to get started!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
