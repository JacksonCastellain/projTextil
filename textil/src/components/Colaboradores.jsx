import NavBar from "./NavBar";
import { useEffect, useState } from 'react';
import ModalColaboradores from "./Modal/ModalColaboradores";
import ModalSucesso from "./Modal/ModalSucesso";
import '../styles/Colaboradores.css';
import { Card, Table, Pagination } from 'react-bootstrap';

const Colaboradores = () => {
  const [colaboradores, setColaboradores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('edit');
  const [selectedColaborador, setSelectedColaborador] = useState(null);
  const [showModalSucesso, setShowModalSucesso] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); 

  useEffect(() => {
    fetchColaboradores();
  }, []);

  const fetchColaboradores = async () => {
    try {
      const response = await fetch("http://localhost:80/server.php?action=colaboradores", {
        credentials: 'include'
      });
      const data = await response.json();
  
      // Verifica se a resposta contém a propriedade "colaboradores"
      if (data.colaboradores) {
        setColaboradores(data.colaboradores); // Atualiza o estado com o array correto
      } else {
        console.error('Erro: Propriedade "colaboradores" não encontrada na resposta da API.');
        setColaboradores([]); // Define um array vazio como fallback
      }
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
      setColaboradores([]); // Define um array vazio em caso de erro
    }
  };

  const deleteColaborador = async (id) => {
    try {
      const response = await fetch(`http://localhost:80/server.php?action=deleteColaborador&id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setColaboradores((prevColaboradores) =>
          prevColaboradores.filter((colaborador) => colaborador.id !== id)
        );
      } else {
        console.error('Erro ao excluir colaborador:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao excluir colaborador:', error);
    }
  };

const updateColaborador = (updatedColaborador) => {
  if (updatedColaborador.id) {
    // Atualiza um colaborador existente
    setColaboradores((prevColaboradores) =>
      prevColaboradores.map((colaborador) =>
        colaborador.id === updatedColaborador.id ? updatedColaborador : colaborador
      )
    );
    setModalMode('edit');
    setShowModalSucesso(true);
  } else {
    setColaboradores((prevColaboradores) => [...prevColaboradores, updatedColaborador]);
    setModalMode('add');
    setShowModalSucesso(true);
  }
};

  const handleShowModal = (colaborador) => {
    setSelectedColaborador(colaborador || null);
    setModalMode(colaborador ? 'edit' : 'add');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedColaborador(null);
    setShowModal(false);
  };

  const handleSucessoClose = () => {
    setShowModalSucesso(false);
  };

  // Pagination 
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = colaboradores.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(colaboradores.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <NavBar />
      <h1>Colaboradores</h1>
      <div className="row justify-content-end mx-2 mb-1">
        <button className="btn btn-success col-3 col-md-1" onClick={() => handleShowModal(null, 'add')}>Novo</button>
      </div>
      <Card>
        <Card.Body>
          <Table responsive striped bordered hover>
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
              {currentItems.map((colaborador) => (
                <tr key={colaborador.id}>
                  <td>{colaborador.id}</td>
                  <td>{colaborador.nome}</td>
                  <td>{colaborador.ender}</td>
                  <td>{colaborador.fone}</td>
                  <td className={colaborador.is_admin ? 'admin-yes' : 'admin-no'}>
                    {colaborador.is_admin ? 'Sim' : 'Não'}
                  </td>
                  <td>
                    <div className="d-flex justify-content-around">
                      <button
                        type="button"
                        className="btn btn-warning"
                        onClick={() => handleShowModal(colaborador, 'edit')}
                      >
                        Editar
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-danger"
                        onClick={() => deleteColaborador(colaborador.id)}
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
            
      <ModalColaboradores
        show={showModal}
        onClose={handleCloseModal}
        colaborador={selectedColaborador}
        onUpdate={updateColaborador}
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

export default Colaboradores;

