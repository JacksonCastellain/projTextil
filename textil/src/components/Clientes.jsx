import NavBar from "./NavBar";
import { useState, useEffect } from "react";
import { Card, Table } from "react-bootstrap";


const Clientes = () => {
  const [clientes, setClientes] = useState([]);

  const fetchClientes = async () => {
    try {
      const response = await fetch("http://localhost:80/server.php?action=clientes", {
        credentials: 'include'
      });
      const data = await response.json();
  
      // Verifica se a resposta contém a propriedade "clientes"
      if (data.clientes) {
        setClientes(data.clientes); // Atualiza o estado com o array correto
      } else {
        console.error('Erro: Propriedade "clientes" não encontrada na resposta da API.');
        setClientes([]); // Define um array vazio como fallback
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      setClientes([]); // Define um array vazio em caso de erro
    }
  };

  useEffect(() => {
    fetchClientes();
  } , []);


  return (
    <div>
      <NavBar />
      <h1>Clientes</h1>
      <div className="row justify-content-end mx-2 mb-1">
        <button className="btn btn-success col-3 col-md-1">Novo</button>
      </div>
      <Card>
        <Card.Body>
          <Table responsive striped bordered hover>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CNPJ</th>
                <th>Endereço</th>
                <th>Telefone</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.cnpj}>
                  <td>{cliente.nome}</td>
                  <td>{cliente.cnpj}</td>
                  <td>{cliente.ender}</td>
                  <td>{cliente.fone}</td>
                  <td>
                    <div className="d-flex justify-content-around">
                      <button className="btn btn-warning">Editar</button>
                      <button className="btn btn-danger">Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Clientes;