import {useState, useEffect} from 'react';
import './../_styles/Dashboard.css';
function Dashboard() {

    const [posts, setPosts] = useState([]);
    const [newComment, setNewComment] = useState();
    const [userData, setUserData] = useState(null);
    const [openNewPost, setOpenNewPost] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', startTime: '', endTime: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        console.log("Before trying to get")
      fetch('http://localhost:3000/api/posts')
        .then(response => response.json())
        .then(posts => setPosts(posts))
        .catch(error => console.error('Error fetching users:', error));
    console.log("After trying to get", posts)

     // Fetch user data
     fetch('http://localhost:3000/api/users/profile')
     .then(response => response.json())
     .then(data => {
       setUserData(data);
     })
     .catch(error => {
       console.error('Error fetching user data:', error);
     });

    }, []);

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

    const setLikeState = (index) => {
    setPosts((prevPosts) => {
        const updatedPosts = prevPosts.map((p, i) => {
            if (i === index) {
                // Trigger the API call to update the post
                fetch(`http://localhost:3000/api/posts/${p._id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ likeCount: p.likeCount +1 }),
                })
                .then((response) => response.json())
                .then((updatedPost) => {
                    console.log('Post updated --:', updatedPost);
                })
                .catch((error) => console.error('Error updating post:', error));
                
                // Update the local state
                return { ...p, likeCount: p.likeCount + 1 };
            }
            return p; // Return unchanged post for others
        });
        return updatedPosts;
    });
};

const handleCommentChange = (e) => {
    setNewComment(e.target.value);
};

const handleCommentSubmit = async (e, postIndex) => {
  e.preventDefault(); // Prevent the default form submission behavior

  if (newComment.trim() === '') return; // Prevent empty comments

  const updatedComment = { username: "username", text: newComment };

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
  if (!userData) {
    console.error('User data not loaded yet.');
    return; // Prevent creating post if user data is not available
  }
  try {
    const formData = new FormData();
    formData.append('username', userData.username); // Use fetched username
    formData.append('title', newPost.title);
    formData.append('description', newPost.content);
    formData.append('startTime', newPost.startTime || '');
    formData.append('endTime', newPost.endTime || '');
    if (imageFile) {
      formData.append('image', imageFile);
    }
    const response = await fetch('http://localhost:3000/api/posts', {
      method: 'POST',
      body: formData,
    });
    const savedPost = await response.json();
    // Add the newly created post to the existing posts list
    setPosts([savedPost, ...posts]);
    setOpenNewPost(false);
    setNewPost({ title: '', content: '', startTime: '', endTime: '' });
    setImageFile(null);
    setImagePreview(null);
  } catch (error) {
    console.error('Error creating post:', error);
  }
};

    return (
        <div>
            <div className = "main-container">
                <div className = "my-profile-container">
                    <div className = "header-container">
                        <div className = "my-image"></div>
                        <div className = "my-name">John Doe</div>
                    </div>
                    <button className = "view-my-profile">View Profile</button>
                    <button 
                      onClick={() => setOpenNewPost(true)}
                      className="view-my-profile mt-2"
                    >
                      Create New Post
                    </button>
                </div>
                <div className = "my-progress-container">
                    <div className="progress-info">
                        <div className="header-text">Streaks and Activity</div>
                        <div className="info-container">
                            <div className="progress-bar-header">
                                Steps <div>8000/10000</div>
                            </div>
                            <div
                                style={{
                                    marginTop: '0.5rem',
                                    width: '100%',
                                    background: '#e0e0e0',
                                    borderRadius: '8px',
                                    height: '14px',
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    style={{
                                        width: '60%', // Example: 60% progress
                                        height: '100%',
                                        background: '#3C82F6',
                                        borderRadius: '8px 0 0 8px',
                                        transition: 'width 0.4s',
                                    }}
                                ></div>
                            </div>
                            <div className="progress-bar-header">
                                Workouts <div>5/10</div>
                            </div>
                            <div
                                style={{
                                    marginTop: '0.5rem',
                                    width: '100%',
                                    background: '#e0e0e0',
                                    borderRadius: '8px',
                                    height: '14px',
                                    overflow: 'hidden',
                                    marginBottom: '1rem',
                                }}
                            >
                                <div
                                    style={{
                                        width: '60%', // Example: 60% progress
                                        height: '100%',
                                        background: '#3C82F6',
                                        borderRadius: '8px 0 0 8px',
                                        transition: 'width 0.4s',
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                    
                </div>
                <div className = "daily-challenge-container">
                <div className = "header-text">Challenges</div>
                    <div className = "daily-challenge">
                        12,000 Steps 
                    </div>
                </div>
            </div>
            <div className = "feed-container">
    
                <div className = "feed-box">
                    {posts.map((post, index) => (
                        <div key = {index} className = "post-container"> 
                            <div className = "username"> {post.username} </div>
                            <div className = "description"> {post.description}</div>
                            <div style={{
                                width: '100%',
                                height: '300px',
                                background: '#e0e0e0',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#888',
                                fontSize: '1rem',
                                margin: '0.5rem 0'
                            }}>
                            </div>
                            <div className = "time"> 
                                <div className = "start-time"> {post.startTime} </div>
                                <div> - </div>
                                <div className = "end-time"> {post.endTime} </div>
                            </div>
                            <div className = "like-container"> 
                            <button className = "react-button" type="button" aria-label="like" onClick = {() => (setLikeState(index))} >👍 {post.likeCount}</button>
                            <button className = "react-button" type="button" aria-label="comment" onClick = {() => (setCommentState(index))}>💬 {post.comments.length}</button>
                            </div>
                            {post.commentstate === false?(<div></div>):(<div className = "comment-container"> 
                                {post.comments.map((comment, index) => (
                                    <div key = {index} className = "comment-box">
                                        <div className = "comment-username"> {comment.username} </div>
                                        <div className = "comment-text"> {comment.text} </div>
                                    </div>
                                ))}
                                <form  onSubmit={(e) => handleCommentSubmit(e, index)} className="mb-4"> 
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
                            </div>)}
                        </div>
                    ))}
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
                    placeholder="Description"
                    className="w-full border rounded-lg p-2 mb-4 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Start Time (e.g., 9:00 AM)"
                    className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newPost.startTime}
                    onChange={(e) => setNewPost({ ...newPost, startTime: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="End Time (e.g., 10:00 AM)"
                    className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newPost.endTime}
                    onChange={(e) => setNewPost({ ...newPost, endTime: e.target.value })}
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

export default Dashboard;