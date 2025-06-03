import React, { useState, useEffect } from 'react';
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from 'react-router-dom';

function UserProfile() {
  const { userId, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [openNewPost, setOpenNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', startTime: '', endTime: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editedFitnessInfo, setEditedFitnessInfo] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    fitness_goal: ''
  });
  const [newComment, setNewComment] = useState('');
  const [postError, setPostError] = useState('');

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Fetch user data
    fetch(`http://localhost:3000/api/users/profile?userId=${userId}`, {
      headers: {
        'Authorization': 'Basic ' + btoa('admin:password')
      }
    })
      .then(response => response.json())
      .then(data => {
        setUserData(data);
        setLoading(false);
        // Initialize fitness info for editing
        setEditedFitnessInfo({
          age: data.age || '',
          gender: data.gender || '',
          height: data.height || '',
          weight: data.weight || '',
          fitness_goal: data.fitness_goal || ''
        });
        // After getting user data, fetch their posts
        return fetch(`http://localhost:3000/api/users/${data._id}/posts`, {
          headers: {
            'Authorization': 'Basic ' + btoa('admin:password')
          }
        });
      })
      .then(response => response.json())
      .then(posts => {
        // Initialize commentstate to true so comments are visible by default
        const postsWithCommentState = posts.map(post => ({ ...post, commentstate: true }));
        setPosts(postsWithCommentState);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, [userId]);

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
      // Validate required fields
      if (!newPost.title.trim()) {
        setPostError('Please enter a title');
        return;
      }
      if (!newPost.content.trim()) {
        setPostError('Please enter a description');
        return;
      }
      if (!newPost.startTime.trim()) {
        setPostError('Please enter a start time');
        return;
      }
      if (!newPost.endTime.trim()) {
        setPostError('Please enter an end time');
        return;
      }

      const formData = new FormData();
      formData.append('username', userData.username);
      formData.append('title', newPost.title);
      formData.append('description', newPost.content);
      formData.append('content', newPost.content);
      formData.append('startTime', newPost.startTime);
      formData.append('endTime', newPost.endTime);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch('http://localhost:3000/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa('admin:password')
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }

      const savedPost = await response.json();
      
      // Add the new post to the beginning of the posts array
      setPosts(prevPosts => [{
        ...savedPost,
        commentstate: true,
        likes: savedPost.likes || [],
        likeCount: savedPost.likeCount || 0,
        comments: savedPost.comments || []
      }, ...prevPosts]);

      setOpenNewPost(false);
      setNewPost({ title: '', content: '', startTime: '', endTime: '' });
      setImageFile(null);
      setImagePreview(null);
      setPostError('');
    } catch (error) {
      console.error('Error creating post:', error);
      setPostError('Failed to create post. Please try again.');
    }
  };

  const handleSaveChanges = async () => {
    try {
      const formData = new FormData();
      formData.append('username', editedUsername);
      if (editImageFile) {
        formData.append('profileImage', editImageFile);
      }
      // Append fitness information
      formData.append('age', editedFitnessInfo.age);
      formData.append('gender', editedFitnessInfo.gender);
      formData.append('height', editedFitnessInfo.height);
      formData.append('weight', editedFitnessInfo.weight);
      formData.append('fitness_goal', editedFitnessInfo.fitness_goal);

      console.log('Sending update request with formData:', Object.fromEntries(formData.entries()));

      const response = await fetch(`http://localhost:3000/api/users/${userData._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': 'Basic ' + btoa('admin:password')
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save changes');
      }

      const updatedUser = await response.json();
      console.log('Received updated user data:', updatedUser);
      
      // Update the userData state with the new information
      setUserData(prevData => ({
        ...prevData,
        ...updatedUser,
        age: updatedUser.age || prevData.age,
        gender: updatedUser.gender || prevData.gender,
        height: updatedUser.height || prevData.height,
        weight: updatedUser.weight || prevData.weight,
        fitness_goal: updatedUser.fitness_goal || prevData.fitness_goal,
        username: updatedUser.username || prevData.username,
        profileImageUrl: updatedUser.profileImageUrl || prevData.profileImageUrl
      }));

      setOpenEditProfile(false);
      setEditedUsername('');
      setEditImageFile(null);
      setEditImagePreview(null);

    } catch (error) {
      console.error('Error saving profile changes:', error);
    }
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const setCommentState = (index) => {
    setPosts(prevPosts =>
      prevPosts.map((post, i) =>
        i === index ? { ...post, commentstate: !post.commentstate } : post
      )
    );
  };

  const handleCommentSubmit = async (e, postIndex) => {
    e.preventDefault();

    if (newComment.trim() === '') return;

    const updatedComment = { username: userData.username, text: newComment };

    setPosts((prevPosts) =>
      prevPosts.map((post, index) =>
        index === postIndex
          ? {
              ...post,
              comments: [...post.comments, updatedComment],
            }
          : post
      )
    );

    setNewComment('');

    try {
      const postId = posts[postIndex]._id;
      const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comments: [...posts[postIndex].comments, updatedComment],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update the post');
      }

      const updatedPost = await response.json();
      console.log('Post updated:', updatedPost);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const setLikeState = async (index) => {
    if (!userData || !userData._id) {
      console.error('User data not available for liking.');
      return;
    }

    const post = posts[index];
    const userId = userData._id;
    const hasLiked = post.likes.includes(userId);
    const newLikes = hasLiked
      ? post.likes.filter(id => id !== userId)
      : [...post.likes, userId];
    const newLikeCount = hasLiked ? post.likeCount - 1 : post.likeCount + 1;

    // Optimistically update the state
    setPosts((prevPosts) =>
      prevPosts.map((p, i) =>
        i === index ? { ...p, likes: newLikes, likeCount: newLikeCount } : p
      )
    );

    // Send the update to the backend
    try {
      const postId = post._id;
      const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId }), // Send userId to backend
      });

      if (!response.ok) {
        // If backend update fails, revert the optimistic update
        console.error('Failed to update like status on backend.');
        setPosts((prevPosts) =>
          prevPosts.map((p, i) => (i === index ? post : p))
        );
        return;
      }

      const updatedPost = await response.json();
      console.log('Like status updated on backend:', updatedPost);
      // Optionally, sync state with backend response if needed, but optimistic update is often preferred for perceived performance.

    } catch (error) {
      console.error('Error updating like status:', error);
      // Revert optimistic update on error
      setPosts((prevPosts) =>
        prevPosts.map((p, i) => (i === index ? post : p))
      );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your profile</h2>
          <a href="/login" className="text-blue-500 hover:text-blue-600">Go to Login</a>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">User not found</h2>
        </div>
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
                  src={user.profileImageUrl || 'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg'}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-2xl font-bold mb-2">{user.username}</h1>
              <p className="text-gray-600 mb-1">{user.email}</p>
              <p className="text-gray-500 text-sm mb-6">
                Member since: {new Date(user.createdAt).toLocaleDateString()}
              </p>
              
              {/* Fitness Information Section */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Fitness Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="font-medium">{editedFitnessInfo.age || user.age || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-medium">{editedFitnessInfo.gender || user.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Height</p>
                    <p className="font-medium">{editedFitnessInfo.height ? `${editedFitnessInfo.height} cm` : user.height ? `${user.height} cm` : 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Weight</p>
                    <p className="font-medium">{editedFitnessInfo.weight ? `${editedFitnessInfo.weight} kg` : user.weight ? `${user.weight} kg` : 'Not specified'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Fitness Goal</p>
                    <p className="font-medium">{editedFitnessInfo.fitness_goal || user.fitness_goal || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => { 
                  setOpenEditProfile(true);
                  setEditedUsername(user.username || ''); 
                  setEditImageFile(null);
                  setEditImagePreview(user.profileImageUrl || 'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg'); 
                }}
                className="w-full bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors mb-6"
              >
                Edit Profile
              </button>
              <button onClick = {() => {
                logout();
                navigate('/')
                
              }}>Logout</button>
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
                {posts.map((post, index) => (
                  <div key={post._id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                    <p className="text-gray-700 mb-4">{post.description || post.content}</p>
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt="Post" className="mb-4 max-h-60 rounded-lg mx-auto" />
                    )}
                    <div className="flex items-center text-gray-500 text-sm">
                      <i className="far fa-clock mr-2"></i>
                      {post.startTime} - {post.endTime}
                    </div>
                    {/* Add Likes and Comments Display */}
                    <div className="flex items-center space-x-4 mt-4">
                      {/* Make Likes Clickable */}
                      <button 
                        className={`flex items-center focus:outline-none ${post.likes && post.likes.includes(user._id) ? 'text-blue-600' : 'text-gray-700'}`} 
                        onClick={() => setLikeState(index)}
                      >
                        <span className="mr-1">👍</span> {post.likeCount || 0}
                      </button>
                      <div className="flex items-center text-gray-700">
                        <span className="mr-1">💬</span> {post.comments.length || 0}
                      </div>
                    </div>
                    {/* Add Comments Display and Form */}
                    {post.commentstate === true && (
                      <div className="comment-container mt-4 bg-gray-100 p-4 rounded-lg">
                        {post.comments.map((comment, commentIndex) => (
                          <div key={commentIndex} className="comment-box mb-2 flex items-start">
                            <div className="comment-username font-bold mr-2 text-blue-600">{comment.username}:</div>
                            <div className="comment-text text-gray-800">{comment.text}</div>
                          </div>
                        ))}
                        <form onSubmit={(e) => handleCommentSubmit(e, index)} className="mt-4">
                          <textarea
                            value={newComment}
                            onChange={handleCommentChange}
                            placeholder="Write a comment..."
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                          />
                          <button
                            type="submit"
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                          >
                            Submit
                          </button>
                        </form>
                      </div>
                    )}
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
            {postError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {postError}
              </div>
            )}
            <input
              type="text"
              placeholder="Title"
              className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newPost.title}
              onChange={(e) => {
                setNewPost({ ...newPost, title: e.target.value });
                setPostError(''); // Clear error when user types
              }}
            />
            <textarea
              placeholder="Description"
              className="w-full border rounded-lg p-2 mb-4 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newPost.content}
              onChange={(e) => {
                setNewPost({ ...newPost, content: e.target.value });
                setPostError(''); // Clear error when user types
              }}
            />
            <input
              type="text"
              placeholder="Start Time (e.g., 9:00 AM)"
              className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newPost.startTime}
              onChange={(e) => {
                setNewPost({ ...newPost, startTime: e.target.value });
                setPostError(''); // Clear error when user types
              }}
            />
            <input
              type="text"
              placeholder="End Time (e.g., 10:00 AM)"
              className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newPost.endTime}
              onChange={(e) => {
                setNewPost({ ...newPost, endTime: e.target.value });
                setPostError(''); // Clear error when user types
              }}
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
                onClick={() => { 
                  setOpenNewPost(false); 
                  setImageFile(null); 
                  setImagePreview(null);
                  setPostError(''); // Clear error when closing
                }}
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

      {/* Edit Profile Modal */}
      {openEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
            {editImagePreview && (
              <img src={editImagePreview} alt="Profile Preview" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
            )}
            <input
              type="file"
              accept="image/*"
              className="mb-4 w-full"
              onChange={(e) => {
                const file = e.target.files[0];
                setEditImageFile(file);
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setEditImagePreview(reader.result);
                  reader.readAsDataURL(file);
                } else {
                  setEditImagePreview(user.profileImageUrl || 'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg');
                }
              }}
            />
            <input
              type="text"
              placeholder="Username"
              className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editedUsername}
              onChange={(e) => setEditedUsername(e.target.value)}
            />
            
            {/* Fitness Information Fields */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  placeholder="Age"
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editedFitnessInfo.age}
                  onChange={(e) => setEditedFitnessInfo({...editedFitnessInfo, age: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editedFitnessInfo.gender}
                  onChange={(e) => setEditedFitnessInfo({...editedFitnessInfo, gender: e.target.value})}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  placeholder="Height"
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editedFitnessInfo.height}
                  onChange={(e) => setEditedFitnessInfo({...editedFitnessInfo, height: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  placeholder="Weight"
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editedFitnessInfo.weight}
                  onChange={(e) => setEditedFitnessInfo({...editedFitnessInfo, weight: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fitness Goal</label>
                <select
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editedFitnessInfo.fitness_goal}
                  onChange={(e) => setEditedFitnessInfo({...editedFitnessInfo, fitness_goal: e.target.value})}
                >
                  <option value="">Select goal</option>
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Muscle Gain">Muscle Gain</option>
                  <option value="Endurance">Endurance</option>
                  <option value="Flexibility">Flexibility</option>
                  <option value="General Fitness">General Fitness</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setOpenEditProfile(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
