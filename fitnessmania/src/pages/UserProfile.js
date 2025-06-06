import React, { useState, useEffect } from 'react';
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from 'react-router-dom';

function prettify(str) {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function UserProfile() {
  const { userId, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [openNewPost, setOpenNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', duration: '', activityType: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [editedUsername, setEditedUsername] = useState('');
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [postError, setPostError] = useState('');
  const [editingCommentFor, setEditingCommentFor] = useState(null);
  const [editedFitnessInfo, setEditedFitnessInfo] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    fitness_goal: ''
  });

  useEffect(() => {
    if (!userId) return;
    
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
      if (!newPost.duration.trim()) {
        setPostError('Please enter the workout duration');
        return;
      }
      if (!newPost.activityType) {
        setPostError('Please select an activity type');
        return;
      }

      const formData = new FormData();
      formData.append('username', userData.username);
      formData.append('title', newPost.title);
      formData.append('description', newPost.content);
      formData.append('duration', newPost.duration);
      formData.append('activityType', newPost.activityType);
      formData.append('tags', newPost.activityType); // Use activityType as tags for backward compatibility
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
      setNewPost({ title: '', content: '', duration: '', activityType: '' });
      setImageFile(null);
      setImagePreview(null);
      setPostError('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const formData = new FormData();
      formData.append('username', editedUsername);
      if (editImageFile) {
        formData.append('profileImage', editImageFile);
      }
      
      // Add fitness information to formData
      if (editedFitnessInfo.age) formData.append('age', editedFitnessInfo.age);
      if (editedFitnessInfo.gender) formData.append('gender', editedFitnessInfo.gender);
      if (editedFitnessInfo.height) formData.append('height', editedFitnessInfo.height);
      if (editedFitnessInfo.weight) formData.append('weight', editedFitnessInfo.weight);
      if (editedFitnessInfo.fitness_goal) formData.append('fitness_goal', editedFitnessInfo.fitness_goal);

      console.log('Current userData:', userData);
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
      const newUserData = {
        ...userData,
        username: editedUsername || userData.username,
        profileImageUrl: updatedUser.profileImageUrl || userData.profileImageUrl,
        age: editedFitnessInfo.age || userData.age,
        gender: editedFitnessInfo.gender || userData.gender,
        height: editedFitnessInfo.height || userData.height,
        weight: editedFitnessInfo.weight || userData.weight,
        fitness_goal: editedFitnessInfo.fitness_goal || userData.fitness_goal
      };
      
      console.log('Setting new userData:', newUserData);
      setUserData(newUserData);

      setOpenEditProfile(false);
      setEditedUsername('');
      setEditImageFile(null);
      setEditImagePreview(null);
      setEditedFitnessInfo({
        age: '',
        gender: '',
        height: '',
        weight: '',
        fitness_goal: ''
      });

    } catch (error) {
      console.error('Error saving profile changes:', error);
    }
  };

  const handleCommentChange = (e, postIndex) => {
    setNewComment(e.target.value);
    setEditingCommentFor(postIndex);
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
    setEditingCommentFor(null);

    try {
      const postId = posts[postIndex]._id;
      const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('admin:password')
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

  // Function to handle username click
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

  

  if (authLoading || loading) {
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
                    <p className="font-medium">{prettify(editedFitnessInfo.gender) || prettify(user.gender) || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Height</p>
                    <p className="font-medium">{editedFitnessInfo.height ? `${editedFitnessInfo.height} in` : user.height ? `${user.height} in` : 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Weight</p>
                    <p className="font-medium">{editedFitnessInfo.weight ? `${editedFitnessInfo.weight} lbs` : user.weight ? `${user.weight} lbs` : 'Not specified'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Fitness Goal</p>
                    <p className="font-medium">{prettify(editedFitnessInfo.fitness_goal) || prettify(user.fitness_goal) || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => { 
                    setOpenEditProfile(true);
                    setEditedUsername(userData.username || ''); 
                    setEditImageFile(null);
                    setEditImagePreview(userData.profileImageUrl || 'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg');
                    setEditedFitnessInfo({
                      age: userData.age || '',
                      gender: userData.gender || '',
                      height: userData.height || '',
                      weight: userData.weight || '',
                      fitness_goal: userData.fitness_goal || ''
                    });
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
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
                {posts.map((post, index) => (
                  <div key={post._id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                    <div className="flex items-center mb-2">
                      <span
                        className="text-blue-600 hover:underline font-bold mr-2 cursor-pointer"
                        onClick={() => handleUsernameClick(post.username)}
                      >
                        {post.username}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{post.description || post.content}</p>
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt="Post" className="mb-4 max-h-60 rounded-lg mx-auto" />
                    )}
                    <div className="flex items-center text-gray-500 text-sm">
                      <i className="far fa-clock mr-2"></i>
                      {new Date(post.createdAt).toLocaleDateString()} • {post.duration}
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
                            <span
                              className="comment-username text-blue-600 hover:underline font-bold mr-2 cursor-pointer"
                              style={{ fontWeight: '600', marginRight: '4px' }}
                              onClick={() => handleUsernameClick(comment.username)}
                            >
                              {comment.username}
                            </span>
                            <div className="comment-text text-gray-800">{comment.text}</div>
                          </div>
                        ))}
                        <form onSubmit={(e) => handleCommentSubmit(e, index)} className="mt-4">
                          <textarea
                            value={editingCommentFor === index ? newComment : ''}
                            onChange={(e) => handleCommentChange(e, index)}
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
            <input
              type="text"
              placeholder="Title"
              className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newPost.title}
              onChange={(e) => {
                setNewPost({ ...newPost, title: e.target.value });
                setPostError('');
              }}
            />
            <textarea
              placeholder="Description"
              className="w-full border rounded-lg p-2 mb-4 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newPost.content}
              onChange={(e) => {
                setNewPost({ ...newPost, content: e.target.value });
                setPostError('');
              }}
            />
            {/* Add Start Time Input */}
            <input
              type="text"
              placeholder="Workout Duration (e.g., 45 minutes)"
              className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newPost.duration}
              onChange={(e) => {
                setNewPost({ ...newPost, duration: e.target.value });
                setPostError('');
              }}
            />
            <select
              className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newPost.activityType}
              onChange={(e) => {
                setNewPost({ ...newPost, activityType: e.target.value });
                setPostError('');
              }}
            >
              <option value="">Select Activity Type</option>
              <option value="Run">Run</option>
              <option value="Bike">Bike</option>
              <option value="Swim">Swim</option>
              <option value="Yoga">Yoga</option>
              <option value="Weight Lifting">Weight Lifting</option>
            </select>
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
                  setPostError('');
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
                  setEditImagePreview(userData.profileImageUrl || 'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg');
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
                  onChange={(e) => setEditedFitnessInfo(prev => ({ ...prev, age: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editedFitnessInfo.gender}
                  onChange={(e) => setEditedFitnessInfo(prev => ({ ...prev, gender: e.target.value }))}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (in)</label>
                <input
                  type="number"
                  placeholder="Height"
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editedFitnessInfo.height}
                  onChange={(e) => setEditedFitnessInfo(prev => ({ ...prev, height: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
                <input
                  type="number"
                  placeholder="Weight"
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editedFitnessInfo.weight}
                  onChange={(e) => setEditedFitnessInfo(prev => ({ ...prev, weight: e.target.value }))}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fitness Goal</label>
                <select
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editedFitnessInfo.fitness_goal}
                  onChange={(e) => setEditedFitnessInfo(prev => ({ ...prev, fitness_goal: e.target.value }))}
                >
                  <option value="">Select Goal</option>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="endurance">Endurance</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="general_fitness">General Fitness</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setOpenEditProfile(false);
                  setEditedUsername('');
                  setEditImageFile(null);
                  setEditImagePreview(null);
                  setEditedFitnessInfo({
                    age: '',
                    gender: '',
                    height: '',
                    weight: '',
                    fitness_goal: ''
                  });
                }}
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
