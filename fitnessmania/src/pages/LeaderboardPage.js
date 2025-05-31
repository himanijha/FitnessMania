import { useEffect, useState } from 'react';
import '../styles/Leaderboard.css';
import { Link, useNavigate } from 'react-router-dom';

function ReminderCard() {
  return (
    <div className="reminders">
      <h3>Reminders</h3>
      <ul>
        <li>Stay hydrated</li>
        <li>Stretch before matches</li>
        <li>Log your score daily</li>
      </ul>
    </div>
  );
}

function LeaderboardRow({ rank, user }) {
  return (
    <tr>
      <td>{rank}</td>
      <td className="user-cell">{user.username}</td>
      <td>{user.score}</td>
      <td>{user.time}</td>
    </tr>
  );
}

export default function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const data = [
      { id: 1, name: 'Serena Williams', score: 15, time: '8:00 AM' },
      { id: 2, name: 'Venus Williams', score: 13, time: '8:45 AM' },
      { id: 3, name: 'Coco Gauff', score: 11, time: '9:10 AM' },
    ];
    setUsers(data);
  }, []);

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-card">
        <div className="leaderboard-header">
          <h2>
            Daily Challenge: <span className="highlight">Tennis</span>
          </h2>
          <button className="refresh-button">Refresh</button>
        </div>

        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Score</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <LeaderboardRow key={user.id} rank={idx + 1} user={user} />
            ))}
          </tbody>
        </table>

        <div className="leaderboard-footer">
          <ReminderCard />
          <button className="share-button">📤 Share Results</button>
        </div>
      </div>
    </div>
  );
}
