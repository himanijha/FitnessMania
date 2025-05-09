import { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Fetch data from backend API
    fetch(`http://localhost:3000/`)
      .then(response => response.text())   
      .then(data => setData(data)) 
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      This is FitnessMania.
      <div>{data}</div>
    </div>
  );
}

export default App;
