import React, { useState, useEffect } from 'react';

function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [openNewPost, setOpenNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    // Fetch user data
    fetch('http://localhost:3000/api/users')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        return response.json();
      })
      .then(users => {
        // For now, use the first user as the profile
        const user = users[0];
        setUserData(user);
        setLoading(false);
        // After getting user data, fetch their posts
        return fetch(`http://localhost:3000/api/users/${user._id}/posts`);
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        return response.json();
      })
      .then(posts => setPosts(posts))
      .catch(error => {
        console.error('Error:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleCreatePost = async () => {
    try {
      const formData = new FormData();
      formData.append('userId', userData._id);
      formData.append('title', newPost.title);
      formData.append('content', newPost.content);
      if (imageFile) {
        formData.append('image', imageFile);
      }
      const response = await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      const savedPost = await response.json();
      setPosts([savedPost, ...posts]);
      setOpenNewPost(false);
      setNewPost({ title: '', content: '' });
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl flex flex-col lg:flex-row items-start justify-center gap-12">
      {/* Profile Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
        {/* Profile Image */}
        <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4 border-4 border-white shadow">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=random`}
            alt={userData.username}
            className="w-full h-full object-cover"
            onError={e => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${userData.username?.[0] ?? 'U'}`; }}
          />
        </div>
        <h1 className="text-2xl font-bold mb-1 text-center">{userData.username}</h1>
        <p className="text-gray-600 mb-1 text-center">{userData.email}</p>
        <p className="text-gray-500 text-sm mb-6 text-center">
          Member since: {new Date(userData.createdAt).toLocaleDateString()}
        </p>
        <button className="w-full bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors mb-6 font-semibold">
          Edit Profile
        </button>
        {/* Stat Cards */}
        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center bg-gray-50 rounded-lg p-4 shadow text-center gap-4">
            <span className="text-blue-500 text-2xl"><i className="fas fa-dumbbell"></i></span>
            <div className="flex-1">
              <div className="text-xl font-bold">45</div>
              <div className="text-gray-600 text-sm">Workouts Completed</div>
            </div>
          </div>
          <div className="flex items-center bg-gray-50 rounded-lg p-4 shadow text-center gap-4">
            <span className="text-green-500 text-2xl"><i className="fas fa-running"></i></span>
            <div className="flex-1">
              <div className="text-xl font-bold">1350</div>
              <div className="text-gray-600 text-sm">Total Minutes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Card */}
      <div className="flex-1 w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold">My Posts</h2>
          <button
            onClick={() => setOpenNewPost(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors w-full sm:w-auto font-semibold"
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
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post._id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow border border-gray-100">
                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                <p className="text-gray-700 mb-4">{post.content}</p>
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="Post" className="mb-4 max-h-60 rounded-lg mx-auto" />
                )}
                <div className="flex items-center text-gray-500 text-sm">
                  <i className="far fa-clock mr-2"></i>
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
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
            <input
              type="file"
              accept="image/*"
              className="mb-4"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mb-4 max-h-40 rounded-lg mx-auto" />
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => { setOpenNewPost(false); setImageFile(null); setImagePreview(null); }}
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
