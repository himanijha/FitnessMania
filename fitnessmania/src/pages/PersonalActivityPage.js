import React, { useState, useEffect } from 'react';
import { useAuth } from "../contexts/AuthContext";

const PersonalActivity = () => {
  const { userId, loading } = useAuth();
  const [userData, setUserData] = useState(null);
  const [activities, setActivities] = useState({
    run: { goal: 0, current: 0 },
    bike: { goal: 0, current: 0 },
    yoga: { goal: 0, current: 0 },
    swim: { goal: 0, current: 0 },
    weights: { goal: 0, current: 0 },
  });
  const tagOptions = ['Run', 'Bike', 'Yoga', 'Swim', 'Weights'];
  const [posts, setPosts] = useState([]);

  useEffect(() => {
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
      console.log("USER DATA: ", data, "GOALS: ", data.goals, "ID: ", data._id);
      // Set goals from userData if available
    if (data && data.goals) {
      setActivities(prev => ({
        ...prev,
        run: { ...prev.run, goal: data.goals.run || 0 },
        bike: { ...prev.bike, goal: data.goals.bike || 0 },
        yoga: { ...prev.yoga, goal: data.goals.yoga || 0 },
        swim: { ...prev.swim, goal: data.goals.swim || 0 },
        weights: { ...prev.weights, goal: data.goals.weights || 0 }
      }));
    }

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
        
        setActivities(prev => ({
          ...prev,
          [tag.toLowerCase()]: { ...prev[tag.toLowerCase()], current: posts.length }
        }));
      } catch (error) {
        console.error(`Error fetching ${tag} posts:`, error);
      }
    }
    };

    // Fetch posts for each tag
    tagOptions.forEach(tag => {
      fetchPosts(tag, data._id);
    });


    })
    .catch(error => {
      console.error('Error fetching user data:', error);
    });
}, [userId, loading]);

  
  
  const handleGoalChange = async (activity, value) => {
    console.log("INHANDLEGOALCHANGE - ACTIVITY: ", activity, "VALUE: ", value);
    try {
      console.log("next line is response");
      const response = await fetch(`http://localhost:3000/api/users/${userData._id}/goals`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('admin:password')
        },
        body: JSON.stringify({ 
          goals: { 
            [activity]: parseInt(value, 10) 
          } 
        }),
      });
      console.log("response: ", response);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save changes');
      }

      setActivities(prev => ({
        ...prev,
        [activity]: { ...prev[activity], goal: Number(value) }
      }));
    } catch (error) {
      console.error('Error updating goal:', error);
      // Optionally show error to user via toast/alert
    }
  };

  const handleProgressChange = (activity, value) => {
    setActivities(prev => ({
      ...prev,
      [activity]: { ...prev[activity], current: Number(value) }
    }));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ 
        width: '33%', 
        padding: '2rem',
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #dee2e6'
      }}>
        <h2 className="text-2xl font-bold mb-6">Weekly Activity Progress</h2>
        
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Run Workout Goals</h3>
            <input
              type="number"
              placeholder="Set weekly goal"
              value={activities.run.goal}
              onChange={(e) => handleGoalChange('run', e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Bike Workout Goals</h3>
            <input
              type="number"
              placeholder="Set weekly goal"
              value={activities.bike.goal}
              onChange={(e) => handleGoalChange('bike', e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Yoga Workout Goals</h3>
            <input
              type="number"
              placeholder="Set weekly goal"
              value={activities.yoga.goal}
              onChange={(e) => handleGoalChange('yoga', e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Swim Workout Goals</h3>
            <input
              type="number"
              placeholder="Set weekly goal"
              value={activities.swim.goal}
              onChange={(e) => handleGoalChange('swim', e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Weight Lifting Workout Goals</h3>
            <input
              type="number"
              placeholder="Set weekly goal"
              value={activities.weights.goal}
              onChange={(e) => handleGoalChange('weights', e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Progress Display */}
      <div style={{ 
        flex: 1, 
        padding: '2rem',
        backgroundColor: '#ffffff'
      }}>
        <h2 className="text-2xl font-bold mb-6">Current Progress</h2>
        
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Running Progress</h3>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(activities.run.current / activities.run.goal) * 100}%` }}
            ></div>
          </div>
          <p className="mt-2 text-gray-600">{activities.run.current} / {activities.run.goal} runs</p>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Biking Progress</h3>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(activities.bike.current / activities.bike.goal) * 100}%` }}
            ></div>
          </div>
          <p className="mt-2 text-gray-600">{activities.bike.current} / {activities.bike.goal} rides</p>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Yoga Progress</h3>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(activities.yoga.current / activities.yoga.goal) * 100}%` }}
            ></div>
          </div>
          <p className="mt-2 text-gray-600">{activities.yoga.current} / {activities.yoga.goal} sessions</p>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Swim Progress</h3>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(activities.swim.current / activities.swim.goal) * 100}%` }}
            ></div>
          </div>
          <p className="mt-2 text-gray-600">{activities.swim.current} / {activities.swim.goal} sessions</p>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2">Weight Lifting Progress</h3>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(activities.weights.current / activities.weights.goal) * 100}%` }}
            ></div>
          </div>
          <p className="mt-2 text-gray-600">{activities.weights.current} / {activities.weights.goal} sessions</p>
        </div>
      </div>
    </div>
  );
};

export default PersonalActivity;
