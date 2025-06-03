import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NavBar.css';

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          FITNESS MANIA
        </div>
        <div className="navbar-links">
          <Link to="/dashboard" className="navbar-link">
            Dashboard
          </Link>
          <Link to="/user-profile" className="navbar-link">
            User Profile
          </Link>
          <Link to="/leaderboard" className="navbar-link">
            Leaderboard
          </Link>
          <Link to="/personal-activity" className="navbar-link">
            Personal Activity
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;