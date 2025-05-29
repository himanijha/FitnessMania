import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import LandingPage from './pages/LandingPage';
import LeaderboardPage from './pages/LeaderboardPage';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function App() {
  

  return (
    <Router>
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex space-x-6">
            <Link to="/" className="text-white hover:text-gray-300 transition duration-300">Landing</Link>
            <Link to="/dashboard" className="text-white hover:text-gray-300 transition duration-300">Dashboard</Link>
            <Link to="/user-profile" className="text-white hover:text-gray-300 transition duration-300">UserProfile</Link>
            <Link to="/leaderboard" className="text-white hover:text-gray-300 transition duration-300">Leaderboard</Link>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;


