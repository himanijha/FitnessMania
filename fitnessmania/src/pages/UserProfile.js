import React, { useState, useEffect } from 'react';

function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [openNewPost, setOpenNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });

  useEffect(() => {
    // Fetch user data
    fetch('http://localhost:3000/api/users/profile')
      .then(response => response.json())
      .then(data => {
        setUserData(data);
        setLoading(false);
        // After getting user data, fetch their posts
        return fetch(`http://localhost:3000/api/users/${data._id}/posts`);
      })
      .then(response => response.json())
      .then(posts => setPosts(posts))
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);

  const handleCreatePost = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData._id,
          ...newPost
        }),
      });
      const savedPost = await response.json();
      setPosts([savedPost, ...posts]);
      setOpenNewPost(false);
      setNewPost({ title: '', content: '' });
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const mockUserData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    joinDate: '2024-01-01',
    stats: {
      workoutsCompleted: 45,
      totalMinutes: 1350
    }
  };

  const user = userData || mockUserData;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
            {/* Profile Header */}
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden">
                <img
                  src="/path-to-user-avatar.jpg"
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
              <p className="text-gray-600 mb-1">{user.email}</p>
              <p className="text-gray-500 text-sm mb-6">
                Member since: {new Date(user.joinDate).toLocaleDateString()}
              </p>
              <button className="w-full bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors mb-6">
                Edit Profile
              </button>
            </div>

            {/* Stats Cards */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-blue-500 text-2xl mb-2">
                  <i className="fas fa-dumbbell"></i>
                </div>
                <div className="text-xl font-bold mb-1">{user.stats.workoutsCompleted}</div>
                <div className="text-gray-600">Workouts Completed</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-green-500 text-2xl mb-2">
                  <i className="fas fa-running"></i>
                </div>
                <div className="text-xl font-bold mb-1">{user.stats.totalMinutes}</div>
                <div className="text-gray-600">Total Minutes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Posts */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">My Posts</h2>
              <button
                onClick={() => setOpenNewPost(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create New Post
              </button>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-gray-500 mb-2">No posts yet.</div>
                <button
                  onClick={() => setOpenNewPost(true)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  Create your first post!
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post._id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                    <p className="text-gray-700 mb-4">{post.content}</p>
                    <div className="flex items-center text-gray-500 text-sm">
                      <i className="far fa-clock mr-2"></i>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      {openNewPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Create New Post</h2>
            <input
              type="text"
              placeholder="Title"
              className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            />
            <textarea
              placeholder="Content"
              className="w-full border rounded-lg p-2 mb-4 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setOpenNewPost(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
