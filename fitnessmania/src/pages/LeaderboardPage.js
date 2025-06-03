import { useEffect, useState } from 'react';
import '../styles/Leaderboard.css';

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    avgScore: 0,
    topScore: 0
  });
  const [showChallengeModal, setShowChallengeModal] = useState(false);

  const enhanceUserData = (userData) => {
    return userData.map(user => ({
      ...user,
      level: Math.floor((user.dailychallenge_score || 0) / 150) + 1,
      streak: Math.floor(Math.random() * 30) + 1,
      joinDate: user.createdAt || '2024-01-01',
      achievements: generateAchievements(user.dailychallenge_score || 0),
      totalWorkouts: Math.floor((user.dailychallenge_score || 0) / 15) + Math.floor(Math.random() * 20),
      avgPerformance: Math.min(Math.floor((user.dailychallenge_score || 0) / 30) + 50 + Math.floor(Math.random() * 20), 100),
      personalBest: (user.dailychallenge_score || 0) + Math.floor(Math.random() * 200),
      previousScore: (user.dailychallenge_score || 0) - Math.floor(Math.random() * 100) + Math.floor(Math.random() * 50)
    }));
  };

  const generateAchievements = (score) => {
    const achievements = [];
    if (score > 0) achievements.push('First Win');
    if (score > 1000) achievements.push('Week Warrior');
    if (score > 2000) achievements.push('Score Master');
    if (score > 2500) achievements.push('Streak King');
    return achievements;
  };

  const dailyChallenges = [
    "Running",
    "Biking",
    "Doing Yoga",
    "Swimming",
    "Weight Lifting",
  ];

  const getTodaysChallenge = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    return dailyChallenges[dayOfYear % dailyChallenges.length];
  };

  const openChallengeModal = () => {
    setShowChallengeModal(true);
  };

  const closeChallengeModal = () => {
    setShowChallengeModal(false);
  };

  useEffect(() => {
    fetch('http://localhost:3000/api/users', {
      headers: {
        'Authorization': 'Basic ' + btoa('admin:password')
      }
    })
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => (b.dailychallenge_score || 0) - (a.dailychallenge_score || 0));
        const enhancedUsers = enhanceUserData(sorted);
        setUsers(enhancedUsers.slice(0, 5)); // Only keep top 5 users
        calculateStats(enhancedUsers);
      })
      .catch((err) => {
        console.error('Error fetching users:', err);
        setUsers([]);
        setStats({ totalUsers: 0, avgScore: 0, topScore: 0 });
      });
  }, []);

  const calculateStats = (userData) => {
    const totalUsers = userData.length;
    const avgScore = userData.reduce((sum, user) => sum + user.dailychallenge_score, 0) / totalUsers;
    const topScore = userData[0]?.dailychallenge_score || 0;
    
    setStats({
      totalUsers: Math.round(totalUsers),
      avgScore: Math.round(avgScore),
      topScore
    });
  };

  const getMedalIcon = (rank) => {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 2400) return 'text-green-600';
    if (score >= 2200) return 'text-blue-600';
    if (score >= 2000) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 2400) return 'Excellent';
    if (score >= 2200) return 'Good';
    if (score >= 2000) return 'Average';
    return 'Needs Improvement';
  };

  const getTrendIcon = (current, previous) => {
    if (current > previous) return '↗';
    if (current < previous) return '↘';
    return '→';
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Participants</h3>
            <p className="text-3xl font-bold text-slate-600">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Average Score</h3>
            <p className="text-3xl font-bold text-slate-600">{stats.avgScore}</p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Top Score</h3>
            <p className="text-3xl font-bold text-slate-600">{stats.topScore}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Challenges</h3>
              <button 
                onClick={openChallengeModal}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-center hover:bg-blue-700 transition-colors"
              >
                Today's Challenge
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-semibold text-gray-800">Top 5 Rankings</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {users.map((user, index) => {
                  const rank = index + 1;
                  const medal = getMedalIcon(rank);
                  
                  return (
                    <div 
                      key={user._id}
                      className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => openUserModal(user)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {medal && <span className="text-2xl">{medal}</span>}
                            <span className="text-xl font-bold text-gray-600">#{rank}</span>
                          </div>

                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-semibold">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{user.username}</h3>
                            <p className="text-gray-600">Level {user.level}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-8">
                          <div className="text-center">
                            <div className="flex items-center space-x-1">
                              <span className="text-orange-500">🔥</span>
                              <span className="font-semibold text-gray-700">{user.streak}</span>
                            </div>
                            <p className="text-xs text-gray-500">streak</p>
                          </div>

                          <div className="w-32">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Performance</span>
                              <span>{user.avgPerformance}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${user.avgPerformance}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <span className="text-xl font-bold text-gray-800">
                                {user.dailychallenge_score}
                              </span>
                              <span className={`text-lg ${getScoreColor(user.dailychallenge_score - user.previousScore)}`}>
                                {getTrendIcon(user.dailychallenge_score, user.previousScore)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{getScoreLabel(user.dailychallenge_score)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-semibold text-2xl">
                        {selectedUser.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800">{selectedUser.username}</h2>
                      <p className="text-gray-600">Level {selectedUser.level} • Member since {formatDate(selectedUser.joinDate)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-700">{selectedUser.dailychallenge_score}</div>
                    <div className="text-sm text-gray-600">Current Score</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-700">{selectedUser.personalBest}</div>
                    <div className="text-sm text-gray-600">Personal Best</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-700">{selectedUser.streak}</div>
                    <div className="text-sm text-gray-600">Current Streak</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-700">{selectedUser.totalWorkouts}</div>
                    <div className="text-sm text-gray-600">Total Workouts</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Streaks and Activity</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Steps</span>
                        <span>{selectedUser.dailychallenge_score}/10000</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full"
                          style={{ width: `${Math.min((selectedUser.dailychallenge_score / 10000) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Workouts</span>
                        <span>{selectedUser.totalWorkouts}/200</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full"
                          style={{ width: `${Math.min((selectedUser.totalWorkouts / 200) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Achievements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedUser.achievements.map((achievement, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">🏅</span>
                          <span className="font-medium text-gray-700">{achievement}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <button 
                    onClick={closeModal}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Close Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showChallengeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">💪</span>
                    <h2 className="text-2xl font-semibold text-gray-800">Daily Challenge</h2>
                  </div>
                  <button 
                    onClick={closeChallengeModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                <div className="text-center mb-6">
                  <p className="text-lg text-gray-600 mb-4">Today's daily activity is:</p>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <p className="text-xl font-bold text-blue-800">{getTodaysChallenge()}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 text-center">
                    Complete this challenge to earn points and climb the leaderboard! 
                    New challenges refresh daily.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button 
                    onClick={closeChallengeModal}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                  <button 
                    onClick={closeChallengeModal}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Accept Challenge
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}