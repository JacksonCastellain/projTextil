import axios from 'axios'
import { useEffect, useState } from 'react'

const Login = () => {

  const [pessoa, setPessoa] = useState([])

  const getPessoa = async () => {
    try {
      const response = await axios.get('http://localhost:8000/server.php');
      setPessoa(response.data);
    } catch (error) {
      console.error("Erro ao buscar pessoas:", error)
    }
  };
  useEffect(() => {
    getPessoa()
  }, []);

  return (
    <>
      <h1>Login</h1>
      <ul>
        {pessoa.map((pessoa) => (
          <li key={pessoa.pess_id}>{pessoa.nome}</li>
        ))}
      </ul>
    </>
  )
}

export default Login