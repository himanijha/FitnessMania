import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function PublicProfilePage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    // Fetch user info
    fetch(`http://localhost:3000/api/users/profile?userId=${userId}`, {
      headers: {
        'Authorization': 'Basic ' + btoa('admin:password')
      }
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        // Fetch posts for this user
        return fetch(`http://localhost:3000/api/users/${userId}/posts`, {
          headers: {
            'Authorization': 'Basic ' + btoa('admin:password')
          }
        });
      })
      .then(res => res.json())
      .then(postsData => {
        setPosts(postsData);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        setUser(null);
        setPosts([]);
      });
  }, [userId]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">User not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8 text-center">
        <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden">
          <img
            src={user.profileImageUrl || 'https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg'}
            alt={user.username}
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-bold mb-2">{user.username}</h1>
        <p className="text-gray-700 mb-1">{user.first_name} {user.last_name}</p>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Posts</h2>
        {posts.length === 0 ? (
          <div className="text-gray-500">No posts yet.</div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post._id} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                <p className="text-gray-700 mb-2">{post.content || post.description}</p>
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="Post" className="mb-2 max-h-40 rounded-lg mx-auto" />
                )}
                <div className="text-gray-500 text-sm">{new Date(post.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicProfilePage; 