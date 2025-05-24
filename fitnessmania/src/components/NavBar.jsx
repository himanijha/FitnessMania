import React from 'react';
import '../styles/NavBar.css';

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {}
        <div className="navbar-brand">
          FITNESS MANIA
        </div>
        
        {}
        <div className="navbar-links">
          <a href="#" className="navbar-link">
            Log in
          </a>
          <a href="#" className="navbar-link">
            Dashboard
          </a>
          <a href="#" className="navbar-link">
            Leaderboard
          </a>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;