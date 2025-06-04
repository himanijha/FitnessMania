import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Leaderboard.css';
import { useAuth } from '../contexts/AuthContext'; // Import the useAuth hook


const getArrowIcon = (minutes) => {
  if (minutes >= 60) return '↑';
  if (minutes >= 30) return '→';
  return '↓';
};
export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    avgScore: 0,
    topScore: 0
  });
  const [showChallengeModal, setShowChallengeModal] = useState(false);

  // Get the current user's ID and authentication loading state
  const { userId, loading: authLoading } = useAuth();

  const enhanceUserData = (userData, topOverallScore) => {
    return userData.map(user => ({
      ...user,
      joinDate: user.createdAt || '2024-01-01',
      achievements: generateAchievements(user.score || 0),
      totalWorkouts: Math.floor((user.score || 0) / 15) + Math.floor(Math.random() * 20),
      // Recalculate avgPerformance relative to the topOverallScore
      avgPerformance: topOverallScore > 0 ? Math.min(Math.floor(((user.score || 0) / topOverallScore) * 100), 100) : 0,
      personalBest: (user.score || 0) + Math.floor(Math.random() * 200),
      previousScore: (user.score || 0) - Math.floor(Math.random() * 100) + Math.floor(Math.random() * 50),
      postCreationTime: user.postCreationTime,
      likeCount: user.likeCount
    }));
  };

  const generateAchievements = (score) => {
    const achievements = [];
    if (score > 0) achievements.push('First Activity');
    if (score >= 60) achievements.push('Hour Hero');     // 1+ hour
    if (score >= 120) achievements.push('Duration Master'); // 2+ hours
    if (score >= 180) achievements.push('Endurance King'); // 3+ hours
    return achievements;
  };

  const dailyChallenges = [
    "Run",
    "Bike",
    "Swim",
    "Yoga",
    "Weight Lifting",
  ];

  const getTodaysChallenge = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    return dailyChallenges[dayOfYear % dailyChallenges.length];
  };

  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; 
  };

  const openChallengeModal = () => {
    setShowChallengeModal(true);
  };

  const closeChallengeModal = () => {
    setShowChallengeModal(false);
  };

  const handleAcceptChallenge = () => {
    setShowChallengeModal(false);
    navigate('/dashboard');
  };

  const handleUsernameClick = async (username) => {
    try {
      const response = await fetch(`http://localhost:3000/api/users?username=${encodeURIComponent(username)}`, {
        headers: {
          'Authorization': 'Basic ' + btoa('admin:password')
        }
      });
      const users = await response.json();
      if (Array.isArray(users) && users.length > 0) {
        navigate(`/users/${users[0]._id}`);
      } else {
        alert('User not found');
      }
    } catch (err) {
      alert('Error fetching user info');
    }
  };

  useEffect(() => {
    // Wait until authentication status is resolved
    if (authLoading) {
      return;
    }

    const todaysChallenge = getTodaysChallenge();
    const todayDate = getTodayDateString();

    fetch('http://localhost:3000/api/posts', {
      headers: {
        'Authorization': 'Basic ' + btoa('admin:password')
      }
    })
      .then((res) => res.json())
      .then((allPosts) => {
        // Check posts from today
        const todayPosts = allPosts.filter(post => {
          const postDate = new Date(post.createdAt).toISOString().split('T')[0];
          return postDate === todayDate;
        });

        // Check which posts have the right tags
        const matchingPosts = todayPosts.filter(post => {
          let hasMatchingTag = false;
          if (Array.isArray(post.tags)) {
            hasMatchingTag = post.tags.includes(todaysChallenge);
          } else if (typeof post.tags === 'string') {
            hasMatchingTag = post.tags.toLowerCase().includes(todaysChallenge.toLowerCase());
          }
          return hasMatchingTag;
        });

        // Group posts by user and sum their durations
        const userPostData = {};
        matchingPosts.forEach(post => {
          const userIdentifier = post.userId || post.username;
        
          if (userIdentifier && post.duration) {
            const duration = typeof post.duration === 'string' ? parseInt(post.duration) : post.duration;
            // If a user has multiple posts, take the createdAt and likeCount from the first one found
            // For likeCount, sum them up if a user has multiple posts
            if (!userPostData[userIdentifier]) {
              userPostData[userIdentifier] = {
                score: 0,
                createdAt: post.createdAt, // Capture creation time (from first relevant post)
                likeCount: 0 // Initialize like count
              };
            }
            userPostData[userIdentifier].score += duration;
            userPostData[userIdentifier].likeCount += (post.likeCount || 0); // Accumulate like counts
          }
        });

        // Fetch user details for users who have posts with duration
        const userIds = Object.keys(userPostData);
      
        if (userIds.length === 0) {
          setUsers([]);
          setStats({ totalUsers: 0, avgScore: 0, topScore: 0 });
          return;
        }

        // Fetch user details
        fetch('http://localhost:3000/api/users', {
          headers: {
            'Authorization': 'Basic ' + btoa('admin:password')
          }
        })
          .then((res) => res.json())
          .then((allUsers) => {
            // Filter users who have posts today and add their total durations, creation time, and like count
            const usersWithScores = allUsers
              .filter(user => {
                const hasDataById = userPostData[user._id];
                const hasDataByUsername = userPostData[user.username];
                const hasData = hasDataById || hasDataByUsername;
                return hasData;
              })
              .map(user => ({
                ...user,
                score: userPostData[user._id]?.score || userPostData[user.username]?.score,
                postCreationTime: userPostData[user._id]?.createdAt || userPostData[user.username]?.createdAt,
                likeCount: userPostData[user._id]?.likeCount || userPostData[user.username]?.likeCount
              }));

            // Sort by score (total duration) in descending order
            const sorted = usersWithScores.sort((a, b) => (b.score || 0) - (a.score || 0));
            
            // Determine the top score from the sorted list to use for performance calculation
            const topOverallScore = sorted.length > 0 ? sorted[0].score : 0;

            const enhancedUsers = enhanceUserData(sorted, topOverallScore); // Pass topOverallScore
          
            setUsers(enhancedUsers.slice(0, 5)); // Only keep top 5 users
            calculateStats(enhancedUsers);
          })
          .catch((err) => {
            console.error('Error fetching users:', err);
            setUsers([]);
            setStats({ totalUsers: 0, avgScore: 0, topScore: 0 });
          });
      })
      .catch((err) => {
        console.error('Error fetching posts:', err);
        setUsers([]);
        setStats({ totalUsers: 0, avgScore: 0, topScore: 0 });
      });
  }, [authLoading]); // Re-run effect when authLoading changes

  const calculateStats = (userData) => {
    const totalUsers = userData.length;
    const avgScore = userData.reduce((sum, user) => sum + (user.score || 0), 0) / totalUsers;
    const topScore = userData[0]?.score || 0;
    
    setStats({
      totalUsers: Math.round(totalUsers),
      avgScore: Math.round(avgScore),
      topScore
    });
  };

  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 120) return 'text-green-600'; // 2+ hours
    if (score >= 60) return 'text-blue-600';   // 1+ hour
    if (score >= 30) return 'text-yellow-600'; // 30+ minutes
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 120) return 'Excellent';      // 2+ hours
    if (score >= 60) return 'Good';            // 1+ hour
    if (score >= 30) return 'Average';         // 30+ minutes
    return 'Needs Improvement';
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

  // Display loading indicator if authentication is still in progress
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Participants</h3>
            <p className="text-3xl font-bold text-slate-600">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Average Duration</h3>
            <p className="text-3xl font-bold text-slate-600">{stats.avgScore}</p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Longest Duration</h3>
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
                <h2 className="text-2xl font-semibold text-gray-800">Top 5 Rankings - {getTodaysChallenge()}</h2>
              </div>

              <div className="divide-y divide-gray-200">
                {users.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <p>No participants yet for today's challenge: {getTodaysChallenge()}</p>
                    <p className="text-sm mt-2">Be the first to post and claim the top spot!</p>
                  </div>
                ) : (
                  users.map((user, index) => {
                    const rank = index + 1;
                    const medal = getMedalIcon(rank);
                    
                    return (
                      <div 
                        key={user._id}
                        className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${user._id === userId ? 'bg-blue-100' : ''}`}
                        onClick={() => openUserModal(user)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-grow-0 basis-auto">
                            <div className="flex items-center space-x-2">
                              {medal && <span className="text-2xl">{medal}</span>}
                              <span className="text-xl font-bold text-gray-600 w-8 text-center">#{rank}</span>
                            </div>

                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-gray-600 font-semibold">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>

                            <div className="flex-grow">
                              <span
                                className="text-lg font-semibold text-blue-600 hover:underline cursor-pointer"
                                onClick={e => { e.stopPropagation(); handleUsernameClick(user.username); }}
                              >
                                {user.username}
                              </span>
                              {/* Display post creation time */}
                              <p className="text-gray-600">Completed at {new Date(user.postCreationTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-8 flex-shrink-0">
                            <div className="text-center w-28">
                              <div className="flex items-center space-x-1 justify-center">
                                <span className="text-red-500">❤️</span> {/* Heart icon for likes */}
                                <span className="font-semibold text-gray-700">{user.likeCount}</span> {/* Display likeCount */}
                              </div>
                              <p className="text-xs text-gray-500">{user.likeCount === 1 ? '1 like' : `${user.likeCount} likes`}</p> 
                            </div>

                            <div className="w-32 flex-shrink-0">
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

                            <div className="text-right w-28 flex-shrink-0">
                              <div className="flex items-center justify-end space-x-1">
                                <span className="text-xl font-bold text-gray-800">
                                  {user.score}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">{getScoreLabel(user.score)} • {user.score} min</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
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
                      {/* Display post creation time in modal */}
                      <p className="text-gray-600">Created {new Date(selectedUser.postCreationTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} • Member since {formatDate(selectedUser.joinDate)}</p>
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
                    <div className="text-2xl font-bold text-gray-700">{selectedUser.score}</div>
                    <div className="text-sm text-gray-600">Today's Posts</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-700">{selectedUser.personalBest}</div>
                    <div className="text-sm text-gray-600">Personal Best</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-700">{selectedUser.likeCount}</div> {/* Display likeCount in modal */}
                    <div className="text-sm text-gray-600">{selectedUser.likeCount === 1 ? 'Total Like' : 'Total Likes'}</div> {/* Conditional rendering for grammar in modal */}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-700">{selectedUser.totalWorkouts}</div>
                    <div className="text-sm text-gray-600">Total Workouts</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Challenge Progress</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Today's Challenge Posts</span>
                        <span>{selectedUser.score}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full"
                          style={{ width: `${Math.min((selectedUser.score / 10) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Total Workouts</span>
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
                    Post about today's challenge to earn points and climb the leaderboard! 
                    Make sure to tag your post with "{getTodaysChallenge()}" to participate.
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
                    onClick={handleAcceptChallenge}
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