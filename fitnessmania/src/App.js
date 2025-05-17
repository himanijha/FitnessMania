import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UserForm from './components/UserForm';
import UserProfile from './pages/UserProfile';

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
      <nav className="bg-blue-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-white text-xl font-bold">
                FitnessMania
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-white hover:text-blue-100 transition-colors">
                Home
              </Link>
              <Link to="/profile" className="text-white hover:text-blue-100 transition-colors">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 mt-8">
        <Routes>
          <Route path="/" element={
            <div>
              <h1 className="text-3xl font-bold mb-6">
                Welcome to FitnessMania
              </h1>
              <p className="mb-8">
                {data}
              </p>
              <UserForm />
              <h2 className="text-2xl font-bold mt-8 mb-4">
                Users
              </h2>
              <ul className="space-y-2">
                {users.map(user => (
                  <li key={user._id} className="text-gray-700">
                    {user.username} ({user.email})
                  </li>
                ))}
              </ul>
            </div>
          } />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


