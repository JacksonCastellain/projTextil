import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useEffect } from 'react';
import NavBar from './NavBar';

function Home() {
  const navigate = useNavigate();

  const checkSession = async () => {
    try {
      const response = await axios.get('http://localhost:80/server.php?action=check_session', { withCredentials: true });
      if (response.status !== 200) {
        navigate('/');
      }
    } catch (error) {
      navigate('/');
    }
  };

  useEffect(() => {
    checkSession();
  }, []); 

  return (
    <div>
      <NavBar />
      <p>Home</p>
    </div>
  );
}

export default Home;
