import React, { useEffect, useState } from 'react';
import { MdEmojiEvents } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const Leaderboard = () => {
    const { apiRequest } = useAuth();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const loadLeaderboard = async () => {
            const response = await apiRequest('/auth/leaderboard/');
            if (!response.ok) {
                setUsers([]);
                return;
            }
            const data = await response.json();
            setUsers(Array.isArray(data) ? data : []);
        };

        loadLeaderboard();
    }, []);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <MdEmojiEvents className="text-yellow-500 text-xl" />
                <h3 className="font-bold text-gray-800">Weekly Leaderboard</h3>
            </div>
            <div className="divide-y divide-gray-100">
                {users.length === 0 && <div className="p-4 text-sm text-gray-500">No leaderboard data yet.</div>}
                {users.map((user) => (
                    <div key={user.user_id} className={`flex items-center justify-between p-4 ${user.is_current_user ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}`}>
                        <div className="flex items-center gap-4">
                            <span
                                className={`
                flex-shrink-0 w-6 text-center font-bold
                ${user.rank === 1 ? 'text-yellow-500' : user.rank === 2 ? 'text-gray-400' : user.rank === 3 ? 'text-orange-500' : 'text-gray-500'}
              `}
                            >
                                #{user.rank}
                            </span>
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                {(user.display_name || user.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className={`font-medium ${user.is_current_user ? 'text-primary' : 'text-gray-800'}`}>
                                {user.display_name} {user.is_current_user && '(You)'}
                            </span>
                        </div>
                        <span className="font-bold text-gray-600 text-sm">{(user.xp || 0).toLocaleString()} XP</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;
