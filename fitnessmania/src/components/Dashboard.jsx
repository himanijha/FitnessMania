import {useState, useEffect} from 'react';
import './../_styles/Dashboard.css';
function Dashboard() {

    const [posts, setPosts] = useState([]);
    const [filterTags, setFilterTags] = useState(["Yoga"]);
    const [selectedTag, setSelectedTag] = useState('all');

    const handleFilter = (tag) => {
        setSelectedTag(tag);
    };

    const filteredPosts = selectedTag === 'all' 
        ? posts 
        : posts.filter(post => post.tags && post.tags.includes(selectedTag));

    const uniqueTags = [...new Set(posts.flatMap(post => post.tags || []))];

    useEffect(() => {
        console.log("Before trying to get")
      fetch('http://localhost:3000/api/posts')
        .then(response => response.json())
        .then(posts => setPosts(posts))
        .catch(error => console.error('Error fetching users:', error));
    console.log("After trying to get", posts)
    }, []);

    useEffect(() => {
    console.log("Posts updated:", posts);
}, [posts]);

    const setCommentState = (index) => {
    setPosts((prevPosts) => {
        const updatedPosts = prevPosts.map((p, i) => {
            if (i === index) {
                // Trigger the API call to update the post
                fetch(`http://localhost:3000/api/posts/${p._id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ commentstate: !p.commentstate }),
                })
                .then((response) => response.json())
                .then((updatedPost) => {
                    console.log('Post updated --:', updatedPost);
                })
                .catch((error) => console.error('Error updating post:', error));
                
                // Update the local state
                return { ...p, commentstate: !p.commentstate };
            }
            return p; // Return unchanged post for others
        });
        return updatedPosts;
    });
};

    const setLikeState = (index) => {
        setPosts(prevPosts =>
            prevPosts.map((p, i) =>
                i === index
                    ? { ...p, likeCount: p.likeCount + 1 }
                    : p
            )
        );
    }

    return (
        <div className = "container">
            <div className = "side-nav">
                <div className="nav-header">
                    Fitness Mania
                </div>
                <button className = "nav-button">Profile</button>
                <button className = "nav-button"> Feed</button>
                <button className = "nav-button">My Activity</button>
                <button className = "nav-button">Challenges</button>
            </div>
            <div className = "side-content">
            <div className = "main-container">
                <div className = "my-profile-container">
                    <div className = "header-container">
                        <div className = "my-image"></div>
                        <div className = "my-name">John Doe</div>
                    </div>
                    <button className = "view-my-profile">View Profile</button>
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
                const filterTags = ['all', 'workouts', 'nutrition', 'progress'];
                
                <div className="filter-tags">
                    {filterTags.map((tag) => (
                        <button
                            key={tag}
                            className={`filter-tag ${tag === 'all' ? 'active' : ''}`}
                            onClick={() => handleFilter(tag)}
                        >
                            {tag.charAt(0).toUpperCase() + tag.slice(1)}
                        </button>
                    ))}
                </div>
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
                            </div>)}
                        </div>
                    ))}
                </div>
            </div>
            </div>

        
        </div>
    );
}

export default Dashboard;