import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Colaboradores from './components/Colaboradores';
import './styles/App.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';


function AppContent() {
  const location = useLocation();

  const getBackgroundClass = () => {
    switch (location.pathname) {
      case '/':
        return 'login-background'; 
      default:
        return 'all-background';
    }
  };  
  
  return (
    <div className={getBackgroundClass()}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path='/colaboradores' element={<Colaboradores />} />
      </Routes>
    </div>
  );
}

export default AppContent;