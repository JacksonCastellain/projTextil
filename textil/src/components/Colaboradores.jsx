import NavBar from "./NavBar";
import { useEffect, useState } from 'react';
import ModalColaboradores from "./Modal/ModalColaboradores";
import '../styles/Colaboradores.css';
import { Card, Table } from 'react-bootstrap';

const Colaboradores = () => {

  const [colaboradores, setColaboradores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState(null);
  
  useEffect(() => {
    fetchColaboradores();
  }, []);

  const fetchColaboradores = async () => {
    try {
      const response = await fetch("http://localhost:80/server.php?action=colaboradores", {
        credentials: 'include'
      });
      const data = await response.json();
      setColaboradores(data);
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
    }
  };

  const updateColaborador = (updatedColaborador) => {
    setColaboradores((prevColaboradores) => 
      prevColaboradores.map((colaborador) =>
        colaborador.id === updatedColaborador.id ? updatedColaborador : colaborador
      )
    );
  };

  const handleShowModal = (colaborador) => {
    setSelectedColaborador(colaborador);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedColaborador(null);
    setShowModal(false);
  };
  
  return (
    <div>
      <NavBar />
      <h1>Colaboradores</h1>
      <div className="row justify-content-end mx-2 mb-1">
        <button className="btn btn-success col-3 col-md-1">Novo</button>
      </div>
      <Card>
        <Card.Body>
            <Table responsive striped bordered hover >
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Endereço</th>
                  <th>Telefone</th>
                  <th>Admin</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {colaboradores.map((colaborador) => (
                  <tr key={colaborador.id}>
                    <td>{colaborador.id}</td>
                    <td>{colaborador.nome}</td>
                    <td>{colaborador.ender}</td>
                    <td>{colaborador.fone}</td>
                    <td className={colaborador.is_admin ? 'admin-yes' : 'admin-no'}>
                      {colaborador.is_admin ? 'Sim' : 'Não'}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-warning"
                        onClick={() => handleShowModal(colaborador)}
                        >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
        </Card.Body>
      </Card>
      <ModalColaboradores
        show={showModal}
        onClose={handleCloseModal}
        colaborador={selectedColaborador}
        onUpdate={updateColaborador}
      />
    </div>
  );
}

export default Colaboradores;