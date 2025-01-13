import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
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
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;



