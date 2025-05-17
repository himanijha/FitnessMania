import { useState } from 'react';

function UserForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

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

  return (
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
  );
}

export default UserForm;
