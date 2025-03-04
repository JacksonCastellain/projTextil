import NavBar from "./NavBar";
import { useEffect, useState } from 'react';
import ModalCliente from "./Modal/ModalCliente";
import ModalSucesso from "./Modal/ModalSucesso";
import { Card, Table, Pagination } from 'react-bootstrap';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('edit');
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [showModalSucesso, setShowModalSucesso] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    fetchClientes();
  }, []);

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

  const deleteCliente = async (id) => {
    try {
      const response = await fetch(`http://localhost:80/server.php?action=deleteCliente&id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setClientes((prevClientes) =>
          prevClientes.filter((cliente) => cliente.id !== id)
        );
      } else {
        console.error('Erro ao excluir cliente:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
    }
  };

  const updateCliente = (updatedCliente) => {
    setClientes((prevClientes) => {
      if (updatedCliente.id && modalMode === 'edit') {
        const updatedClientes = prevClientes.map((cliente) =>
          cliente.id === updatedCliente.id ? updatedCliente : cliente
        );

        handleCloseModal();
        setShowModalSucesso(true);
        return updatedClientes;

      } else {
        const newCliente = [...prevClientes, updatedCliente];

        handleCloseModal();
        setShowModalSucesso(true);
        return newCliente;

      }
    });
  };

  const handleShowModal = (cliente) => {
    setSelectedCliente(cliente || null);
    setModalMode(cliente ? 'edit' : 'add');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedCliente(null);
    setShowModal(false);
  };

  const handleSucessoClose = () => {
    setShowModalSucesso(false);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = clientes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(clientes.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <NavBar />
      <h1>Clientes</h1>
      <div className="row justify-content-end mx-2 mb-1">
        <button
          className="btn btn-success col-3 col-md-1"
          onClick={() => handleShowModal(null)}
        >
          Novo
        </button>
      </div>
      <Card>
        <Card.Body>
          <Table responsive striped bordered hover>
            <thead>
              <tr>
                <th>CNPJ</th>
                <th>Nome</th>
                <th>Endereço</th>
                <th>Telefone</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.cnpj}</td>
                  <td>{cliente.nome}</td>
                  <td>{cliente.ender}</td>
                  <td>{cliente.fone}</td>
                  <td>
                    <div className="d-flex justify-content-around">
                      <button
                        type="button"
                        className="btn btn-warning"
                        onClick={() => handleShowModal(cliente)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => deleteCliente(cliente.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="custom-pagination">
            <Pagination>
              <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
              <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
              {[...Array(totalPages).keys()].map((page) => (
                <Pagination.Item
                  key={page + 1}
                  active={page + 1 === currentPage}
                  onClick={() => handlePageChange(page + 1)}
                >
                  {page + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
              <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
            </Pagination>
          </div>
        </Card.Body>
      </Card>

      <ModalCliente
        show={showModal}
        onClose={handleCloseModal}
        cliente={selectedCliente}
        onUpdate={updateCliente}
        mode={modalMode}
      />
      <ModalSucesso
        show={showModalSucesso}
        onClose={handleSucessoClose}
        message={modalMode === 'edit' ? 'Dados Atualizados com sucesso!' : 'Dados Inseridos com sucesso!'}
      />
    </div>
  );
};

export default Clientes;