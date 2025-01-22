import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import '../styles/NavBar.css';

const NavBar = () => {

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:80/server.php?action=logout', {}, { withCredentials: true });
      if (response.status === 204) {
        navigate('/');
      }  
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };
  const comeBackHome = () => {
    navigate('/home');
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerTextil" aria-controls="navbarTogglerTextil" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarTogglerTextil">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/colaboradores">Colaboradores</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/products">Produtos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link disabled" to="#" tabIndex="-1" aria-disabled="true">Disabled</Link>
            </li>
          </ul>
          <div className="d-flex justify-content-center">
            <button onClick={comeBackHome} className="btn btn-outline-secondary mx-2">Home</button>
            <button onClick={handleLogout} className="btn btn-outline-danger">Sair</button>
          </div>
        </div>
      </div>
    </nav>

  );
}

export default NavBar;