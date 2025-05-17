import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import UserForm from './components/UserForm';
import LandingPage from './LandingPage';

function App() {
  const [data, setData] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/')
      .then(response => response.json())
      .then(data => setData(data.message))
      .catch(error => console.error('Error fetching data:', error));

    fetch('http://localhost:3000/api/users')
      .then(response => response.json())
      .then(users => setUsers(users))
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="p-4">
              <Link to="/landing">
                <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Go to Landing Page
                </button>
              </Link>
              <h1>This is FitnessMania.</h1>
              <p>{data}</p>
              <UserForm />
              <h2>Users</h2>
              <ul>
                {users.map(user => (
                  <li key={user._id}>{user.username} ({user.email})</li>
                ))}
              </ul>
            </div>
          }
        />
        <Route path="/landing" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;