import { useEffect, useState } from 'react';
import UserForm from './components/UserForm';
import Dashboard from './components/Dashboard';

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
    <div>
      <Dashboard/>
      {/* <h1>This is FitnessMania.</h1>
      <p>{data}</p>
      <UserForm />
      <h2>Users</h2>
      <ul>
        {users.map(user => (
          <li key={user._id}>{user.username} ({user.email})</li>
        ))}
      </ul> */}
    </div>
  );
}

export default App;


