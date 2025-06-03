import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import LandingPage from './pages/LandingPage';
import LeaderboardPage from './pages/LeaderboardPage';
import SignupPage from './pages/SignupPage';
import FitnessInfoPage from './pages/FitnessInfoPage';
import LoginPage from './pages/LoginPage';
import PublicProfilePage from './pages/PublicProfilePage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<><NavBar /><Dashboard /></>} />
        <Route path="/user-profile" element={<><NavBar /><UserProfile /></>} />
        <Route path="/leaderboard" element={<><NavBar /><LeaderboardPage /></>} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/fitness-info" element={<FitnessInfoPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/users/:userId" element={<><NavBar /><PublicProfilePage /></>} />
      </Routes>
    </Router>
  );
}

export default App;


