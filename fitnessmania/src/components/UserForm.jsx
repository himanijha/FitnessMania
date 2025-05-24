import { useState, useEffect } from 'react';

function UserForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [data, setData] = useState('');
  const [users, setUsers] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email }),
    });
    const data = await res.json();
    console.log('✅ User created:', data);
  };

  useEffect(() => {
      fetch('http://localhost:3000/')
        .then(response => response.json())
        .then(data => setData(data.message))
        .catch(error => console.error('Error fetching data:', error));
  
      fetch('http://localhost:3000/api/users')
        .then(response => response.json())
        .then(users => setUsers(users))
        .catch(error => console.error('Error fetching users:', error));
    }, [users]);

  return (
    <>
    <form onSubmit={handleSubmit}>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <button type="submit">Create User</button>
    </form>
    <ul>
        {users.map(user => (
          <li key={user._id}>{user.username} ({user.email})</li>
        ))}
    </ul>
    </>
  );
}

export default UserForm;
