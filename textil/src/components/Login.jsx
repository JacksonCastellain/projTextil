import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Col, Container, Form, Row } from 'react-bootstrap';
import "../styles/Login.css";

const Login = () => {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState(null); 
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:80/server.php?action=login',
        { username: username,
          password: password, }, { withCredentials: true });

      if (response.status === 200) {
        navigate('/home'); 
      } else {
        setError(response.data.error || 'Falha no login.');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Usuário ou senha incorretos.');
    }
  };

  return (
    <div className="container-login">
      <div className="login">
        <h1 className="row justify-content-md-center">Login</h1>
        <Form onSubmit={handleLogin}>
          <Form.Group as={Col} className="mb-3">
            <Form.Label>Usuário:</Form.Label>
            <Form.Control
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
            <Form.Label>Senha:</Form.Label>
            <Form.Control 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </Form.Group>
          <Container>
            <Row>
              <Col>
                <button sm={5} className="btn btn-success" type="submit">
                  Entrar
                </button>
              </Col>
            </Row>
          </Container>
        </Form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
