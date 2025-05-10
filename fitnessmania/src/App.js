import { useEffect, useState } from 'react';
import UserForm from './components/UserForm';

function App() {
  const [data, setData] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/')
      .then(response => response.json())
      .then(data => setData(data.message))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      <h1>This is FitnessMania.</h1>
      <p>{data}</p>
      <UserForm />
    </div>
  );
}

export default App;


