import React from 'react';
import { Link, useNavigate } from 'react-router-dom';


function LandingPage() {
  const navigate = useNavigate();

  // const handleLanding = () => {
  //   console.log("going to dashbaord");
  //   navigate('/dashboard');
  // }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-100 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-lg text-center max-w-md w-full">
        <img
          src="/FitnessMania.png"
          alt="FitnessMania Logo"
          className="mx-auto w-40 h-40 object-contain mb-6"
        />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to FitnessMania!</h1>
        <p className="text-gray-500 mb-6">Your social platform for everything fitness.</p>
        <div className="flex justify-center gap-4">
          <Link to="/dashboard">
            <button className="w-28 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              Sign In
            </button>
          </Link>
          <Link to="/dashboard">
            <button className="w-28 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
              Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;