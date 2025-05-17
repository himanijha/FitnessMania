import {useState} from 'react';
import './../_styles/Dashboard.css';
function Dashboard() {

    const [posts, setPosts] = useState([
        {
            username: 'John Doe',
            title: 'Morning Run',
            startTime: '6:30 AM',
            endTime: '7:15 AM',
            description: 'Ran 5km around the park. Felt energized and ready for the day!',
            commentstate: false,
            likeCount: 0,
            comments: [
                { username: 'Jane Smith', text: 'Great job! Early bird gets the worm.' },
                { username: 'Alex Lee', text: 'Impressive pace for a morning run!' }
            ]
        },
        {
            username: 'John Doe',
            title: 'Yoga Session',
            startTime: '8:00 PM',
            endTime: '8:45 PM',
            description: 'Relaxing evening yoga to improve flexibility and reduce stress.',
            commentstate: false,
            likeCount: 0,
            comments: [
                { username: 'Emily Clark', text: 'Yoga is the best way to end the day.' }
            ]
        },
        {
            username: 'John Doe',
            title: 'Cycling with Friends',
            startTime: '4:00 PM',
            endTime: '5:30 PM',
            description: 'Cycled 15km with friends along the river trail. Great weather and company!',
            commentstate: false,
            likeCount: 0,
            comments: [
                { username: 'Mike Brown', text: 'Wish I could have joined!' },
                { username: 'Sarah Kim', text: 'Sounds like fun!' }
            ]
        }
    ]);

    const setCommentState = (index) => {
        setPosts(prevPosts =>
            prevPosts.map((p, i) =>
                i === index
                    ? { ...p, commentstate: !p.commentstate }
                    : p
            )
        );
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
                    <img 
                        src="https://img.icons8.com/ios-filled/50/000000/dumbbell.png" 
                        alt="Fitness Mania Logo" 
                        style={{ width: '32px', height: '32px', verticalAlign: 'middle', marginRight: '0.5rem' }}
                    />
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
                                        background: '#000',
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
                                        background: '#000',
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