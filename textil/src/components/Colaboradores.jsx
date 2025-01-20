import NavBar from "./NavBar";
import axios from "axios";
import { useEffect, useState } from 'react';

const Colaboradores = () => {

  const [colaboradores, setColaboradores] = useState([]);
  
  useEffect(() => {
    fetchColaboradores();
  }, []);

  const fetchColaboradores = async () => {
    try {
      const response = await axios.get("http://localhost:80/server.php?action=colaboradores", { withCredentials: true });
      setColaboradores(response.data);
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
    }
  };
  
  return (
    <div>
      <NavBar />
      <h1>Colaboradores</h1>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
          </tr>
        </thead>
        <tbody>
          {colaboradores.map((colaborador) => (
            <tr key={colaborador.id}>
              <td>{colaborador.id}</td>
              <td>{colaborador.nome}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Colaboradores;