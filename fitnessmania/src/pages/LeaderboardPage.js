import { useEffect, useState } from 'react';
import '../styles/Leaderboard.css';
import { Link, useNavigate } from 'react-router-dom';

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/users', {
      headers: {
        'Authorization': 'Basic ' + btoa('admin:password')
      }
    })
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => b.dailychallenge_score - a.dailychallenge_score);
        setUsers(sorted);
      })
      .catch((err) => console.error('Error fetching users:', err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
        <thead>
          <tr className="bg-gray-100 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
            <th className="px-6 py-3">Rank</th>
            <th className="px-6 py-3">Username</th>
            <th className="px-6 py-3">Daily Challenge Score</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user._id} className="border-t">
              <td className="px-6 py-4">{index + 1}</td>
              <td className="px-6 py-4">{user.username}</td>
              <td className="px-6 py-4">{user.dailychallenge_score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
