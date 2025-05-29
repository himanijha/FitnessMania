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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
      >
        Create User
      </button>
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
