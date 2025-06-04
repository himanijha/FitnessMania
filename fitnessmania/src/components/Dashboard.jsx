import {useState, useEffect} from 'react';
import './../styles/Dashboard.css';
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from 'react-router-dom';

function Dashboard() {
    const { userId, loading } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [newComment, setNewComment] = useState();
    const [userData, setUserData] = useState(null);
    const [openNewPost, setOpenNewPost] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', duration: '', activityType: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [postError, setPostError] = useState('');
    const [numWorkouts, setNumWorkouts] = useState(0);
    const tagOptions = ['Run', 'Bike', 'Yoga', 'Swim', 'Weight Lifting'];
    // const [activities, setActivities] = useState({
    //   run: { goal: 0, current: 0 },
    //   bike: { goal: 0, current: 0 },
    //   yoga: { goal: 0, current: 0 },
    //   swim: { goal: 0, current: 0 },
    //   weights : { goal: 0, current: 0 },
    // });
    // const tagOptions = ['Run', 'Bike', 'Yoga', 'Swim', 'Weight Lifting'];
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
    
    useEffect(() => {
        // Fetch posts with Authorization header
        fetch('http://localhost:3000/api/posts', {
          headers: {
            'Authorization': 'Basic ' + btoa('admin:password')
          }
        })
          .then(response => response.json())
          .then(posts => setPosts(posts))
          .catch(error => console.error('Error fetching posts:', error));

        // Fetch user data with Authorization header and userId
        console.log("USER ID: ", userId, " ", "LOADING: ", loading);
        fetch(`http://localhost:3000/api/users/profile?userId=${userId}`, {
          headers: {
            'Authorization': 'Basic ' + btoa('admin:password')
          }
        })
        .then(response => response.json())
        .then(data => {
          setUserData(data);
          console.log("USER DATA: ", data);
              const fetchPosts = async (tag, userId) => {
      if (userId !== undefined) {
      try {
        
        const response = await fetch(`http://localhost:3000/api/posts/${tag}/${userId}`, {
          headers: {
            'Authorization': 'Basic ' + btoa('admin:password')
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const posts = await response.json();
        console.log(`POST TAGS for ${tag}:`, posts);
        if (tag === "Weight Lifting") {
          tag = "weights";
        }
        return posts.length
      } catch (error) {
        console.error(`Error fetching ${tag} posts:`, error);
      }
    }
    };

    // Fetch posts for each tag
    const fetchAllPosts = async () => {
      let totalWorkouts = 0;
      for (const tag of tagOptions) {
        const count = await fetchPosts(tag, data._id);
        totalWorkouts += count || 0;
      }
      setNumWorkouts(totalWorkouts);
    };
    
    fetchAllPosts();


    })
    .catch(error => {
      console.error('Error fetching user data:', error);
    });


        }, [userId])
  

    useEffect(() => {
    console.log("Posts updated:", posts);
}, [posts]);

    const setCommentState = (index) => {
    setPosts((prevPosts) => {
        const updatedPosts = prevPosts.map((p, i) => {
            if (i === index) {
                // Update the local state
                return { ...p, commentstate: !p.commentstate };
            }
            return p; // Return unchanged post for others
        });
        return updatedPosts;
    });
};

  const setLikeState = async (index) => {
    if (!userData || !userData._id) {
      console.error('User data not available for liking.');
      return;
    }

    const post = posts[index];
    const userId = userData._id;
    console.log('Current post state:', post);
    console.log('User ID:', userId);

    // Optimistically update the state
    setPosts((prevPosts) =>
      prevPosts.map((p, i) =>
        i === index ? {
          ...p,
          likes: p.likes?.includes(userId) 
            ? p.likes.filter(id => id !== userId)
            : [...(p.likes || []), userId],
          likeCount: p.likes?.includes(userId) 
            ? (p.likeCount || 0) - 1 
            : (p.likeCount || 0) + 1
        } : p
      )
    );

    // Send the update to the backend
    try {
      const postId = post._id;
      console.log('Sending like update for post:', postId);
      const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('admin:password')
        },
        body: JSON.stringify({ userId: userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update like status');
      }

      const updatedPost = await response.json();
      console.log('Received updated post from backend:', updatedPost);
      
      // Update the state with the response from the backend
      setPosts((prevPosts) =>
        prevPosts.map((p, i) =>
          i === index ? {
            ...p,
            ...updatedPost,  // Spread the entire updated post
            likes: updatedPost.likes || [],
            likeCount: updatedPost.likeCount || 0
          } : p
        )
      );

    } catch (error) {
      console.error('Error updating like status:', error);
      // Revert optimistic update on error
      setPosts((prevPosts) =>
        prevPosts.map((p, i) => (i === index ? post : p))
      );
    }
  };

const handleCommentChange = (e) => {
    setNewComment(e.target.value);
};

const handleCommentSubmit = async (e, postIndex) => {
  e.preventDefault(); // Prevent the default form submission behavior

  if (newComment.trim() === '') return; // Prevent empty comments

  const updatedComment = { username: userData?.username || userData.username, text: newComment };

  // Update state optimistically
  setPosts((prevPosts) =>
    prevPosts.map((post, index) =>
      index === postIndex
        ? {
            ...post,
            comments: [...post.comments, updatedComment], // Append new comment locally
          }
        : post
    )
  );

  setNewComment(''); // Clear the input field

  // Perform the API call
  try {
    const postId = posts[postIndex]._id; // Assuming `_id` exists in your posts array
    const response = await fetch(`http://localhost:3000/api/posts/${postId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('admin:password')
      },
      body: JSON.stringify({
        comments: [...posts[postIndex].comments, updatedComment], // Append new comment for backend
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update the post');
    }

    const updatedPost = await response.json();
    console.log('Post updated:', updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    // Optionally: Handle error (e.g., rollback optimistic update or notify the user)
  }
};

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
      setPostError('Failed to create post. Please try again.');
    }
  };

    const handleTagSelect = (tag) => {
      const url = tag ? `http://localhost:3000/api/posts/${tag}` : 'http://localhost:3000/api/posts';
      fetch(url, {
        headers: {
          'Authorization': 'Basic ' + btoa('admin:password')
        }
      })
        .then(response => response.json())
        .then(posts => setPosts(posts))
        .catch(error => console.error('Error fetching posts:', error));
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

    if (loading) {
    return <div>Loading...</div>; // or a spinner
    }


    return (
        <div>
            <div className = "main-container">
                <div className = "my-profile-container">
                    <div className = "header-container">
                        <div className = "my-image" style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            backgroundColor: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {userData?.profileImageUrl ? (
                                <img 
                                    src={userData.profileImageUrl} 
                                    alt="Profile" 
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <img 
                                    src="https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg"
                                    alt="Default Profile"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            )}
                        </div>
                        <div className = "my-name">{userData ? userData.first_name + " " + userData.last_name: ""}</div>
                    </div>
                    <button 
                        className = "view-my-profile"
                        onClick={() => navigate('/user-profile')}
                    >
                        View Profile
                    </button>
                    <button 
                      onClick={() => setOpenNewPost(true)}
                      className="view-my-profile mt-2"
                    >
                      Create New Post
                    </button>
                </div>
                <button onClick={() => navigate('/personal-activity')}>
                <div className = "my-progress-container">
                    <div className="progress-info">
                        <div className="header-text" style={{ textAlign: 'center' }}>Streaks and Activity</div>
                        <div className="info-container">
                            <div style={{
                                fontSize: '1.1rem',
                                color: '#4B5563',
                                fontWeight: '500',
                                marginBottom: '0.5rem',
                                textAlign: 'center'
                            }}>Workouts this week</div>
                            <div style={{
                                fontSize: '1.5rem',
                                color: '#1F2937',
                                fontWeight: '600',
                                textAlign: 'center'
                            }}>{numWorkouts}</div>
                        </div>
                    </div>
                    
                </div>
                </button>
                <div className = "daily-challenge-container" 
                    onClick={() => navigate('/leaderboard')} 
                    style={{ cursor: 'pointer' }}
                >
                    <div className="header-text" style={{ textAlign: 'center' }}>Challenges</div>
                    <div className = "daily-challenge">
                        {getTodaysChallenge()}
                    </div>
                </div>
            </div>
            <div className="feed-container" style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: '20px'
            }}>
                <div className="tag-options" style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    padding: '0.5rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    <button 
                        className="tag-button"
                        onClick={() => handleTagSelect('Run')}
                        style={{
                            padding: '0.5rem 1.5rem',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: '#3C82F6',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontWeight: '500',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#2563EB'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#3C82F6'}
                    >
                        Running
                    </button>
                    <button 
                        className="tag-button"
                        onClick={() => handleTagSelect('Bike')}
                        style={{
                            padding: '0.5rem 1.5rem',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: '#3C82F6',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontWeight: '500',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#2563EB'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#3C82F6'}
                    >
                        Biking
                    </button>
                    <button 
                        className="tag-button"
                        onClick={() => handleTagSelect('Yoga')}
                        style={{
                            padding: '0.5rem 1.5rem',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: '#3C82F6',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontWeight: '500',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#2563EB'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#3C82F6'}
                    >
                        Yoga
                    </button>
                    <button 
                        className="tag-button"
                        onClick={() => handleTagSelect('Swim')}
                        style={{
                            padding: '0.5rem 1.5rem',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: '#3C82F6',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontWeight: '500',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#2563EB'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#3C82F6'}
                    >
                        Swimming
                    </button>
                    <button 
                        className="tag-button"
                        onClick={() => handleTagSelect('Weight Lifting')}
                        style={{
                            padding: '0.5rem 1.5rem',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: '#3C82F6',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontWeight: '500',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#2563EB'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#3C82F6'}
                    >
                        Weight Lifting
                    </button>
                    <button 
                        className="tag-button"
                        onClick={() => handleTagSelect(null)}
                        style={{
                            padding: '0.5rem 1.5rem',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: '#194385',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontWeight: '500',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#0B1F3D'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#194385'}
                    >
                        All Posts
                    </button>
                </div>
                <div className="feed-box" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    {posts.map((post, index) => (
                        <div key={post._id} className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
                            <div className="p-4">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                                        {post.profileImageUrl ? (
                                            <img 
                                                src={post.profileImageUrl} 
                                                alt={post.username} 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                                <i className="fas fa-user text-gray-500"></i>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{post.username}</h3>
                                        <div className="flex items-center text-gray-500 text-sm">
                                            <i className="far fa-clock mr-2"></i>
                                            {new Date(post.createdAt).toLocaleDateString()} • {post.duration}
                                        </div>
                                    </div>
                                </div>
                                <h4 className="text-xl font-semibold mb-2">{post.title}</h4>
                                <p className="text-gray-700 mb-4">{post.description || post.content}</p>
                                {post.imageUrl && (
                                    <div className="relative pb-[100%] mb-4">
                                        <img 
                                            src={post.imageUrl} 
                                            alt="Post" 
                                            className="absolute inset-0 w-full h-full object-contain"
                                        />
                                    </div>
                                )}
                                <div className="like-container" style={{
                                    borderTop: '1px solid #efefef',
                                    paddingTop: '8px'
                                }}> 
                                    <button className="react-button" type="button" aria-label="like" onClick={() => (setLikeState(index))}>👍 {post.likeCount}</button>
                                    <button className="react-button" type="button" aria-label="comment" onClick={() => (setCommentState(index))}>💬 {post.comments.length}</button>
                                </div>
                                {post.commentstate === false ? (<div></div>) : (
                                    <div className="comment-container" style={{
                                        marginTop: '8px',
                                        padding: '0 16px'
                                    }}> 
                                        {post.comments.map((comment, index) => (
                                            <div key={index} className="comment-box" style={{
                                                marginBottom: '4px',
                                                fontSize: '14px'
                                            }}>
                                                <span
                                                    className="comment-username text-blue-600 hover:underline font-bold mr-2 cursor-pointer"
                                                    style={{ fontWeight: '600', marginRight: '4px' }}
                                                    onClick={() => handleUsernameClick(comment.username)}
                                                >
                                                    {comment.username}
                                                </span>
                                                <span className="comment-text">{comment.text}</span>
                                            </div>
                                        ))}
                                        <form onSubmit={(e) => handleCommentSubmit(e, index)} style={{
                                            marginTop: '8px',
                                            borderTop: '1px solid #efefef',
                                            paddingTop: '8px'
                                        }}> 
                                            <textarea
                                                value={newComment}
                                                onChange={handleCommentChange}
                                                placeholder="Write a comment..."
                                                style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    border: '1px solid #efefef',
                                                    borderRadius: '4px',
                                                    resize: 'none',
                                                    fontSize: '14px'
                                                }}
                                                rows="2"
                                            />
                                            <button
                                                type="submit"
                                                style={{
                                                    marginTop: '8px',
                                                    padding: '6px 12px',
                                                    backgroundColor: '#0095f6',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Post
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
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
                    <option value="Run">Running</option>
                    <option value="Bike">Biking</option>
                    <option value="Swim">Swimming</option>
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

        
        </div>
    );
}

export default Dashboard;