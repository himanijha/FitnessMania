import { useEffect, useState } from 'react';
import Dashboard from '../components/Dashboard';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
    const navigate = useNavigate();
  return (
    <div>
      <Dashboard/>
    </div>
  );
}

export default DashboardPage;


