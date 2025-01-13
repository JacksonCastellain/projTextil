import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useEffect } from 'react';

function Home() {
  const navigate = useNavigate();

  const checkSession = async () => {
    try {
      const response = await axios.get('http://localhost:8000/server.php?action=check_session', { withCredentials: true });
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

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:8000/server.php?action=logout', {}, { withCredentials: true });
      if (response.status === 204) {
        navigate('/');
      }  
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div>
      <p>Home</p>
      <button onClick={handleLogout} className="btn btn-danger" type="logout">Sair</button>
    </div>
  );
}

export default Home;
