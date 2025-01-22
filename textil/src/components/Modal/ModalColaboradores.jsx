import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import ModalSucesso from './ModalSucesso';

const ModalColaboradores = ({ show, onClose, colaborador, onUpdate }) => {
  const [nome, setNome] = useState('');
  const [ender, setEnder] = useState('');
  const [fone, setFone] = useState('');
  const [is_admin, setIsAdmin] = useState(false);
  const [showModalSucesso, setShowModalSucesso] = useState(false);

  useEffect(() => {
    if (colaborador) {
      setNome(colaborador.nome); 
      setEnder(colaborador.ender);
      setFone(colaborador.fone);
      setIsAdmin(colaborador.is_admin);
    }
  }, [colaborador]);

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost/server.php?action=updateColaborador&id=${colaborador.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome, ender, fone, is_admin }),
        credentials: "include" 
      });
  
      const result = await response.json();
      onUpdate({ ...colaborador, nome, ender, fone, is_admin });
      setShowModalSucesso(true);
      
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  const handleClose = () => {
    setNome(colaborador ? colaborador.nome : ''); 
    onClose(); 
  };

  const handleSucessoClose = () => {
    setShowModalSucesso(false);
    onClose();
  };
  
  
  return (
    <Modal show={show} onHide={handleClose} centered size="xs">
      <Modal.Header closeButton>
        <Modal.Title>Editar Colaborador</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {colaborador ? (
          <div>
            <div>
              <label className="form-label"><strong>ID</strong></label>
              <input type="text" className="form-control" value={colaborador.id} readOnly />
            </div>
            <div>
              <label className="form-label"><strong>Nome</strong></label>
              <input
                type="text"
                className="form-control"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label"><strong>Endereço</strong></label>
              <input
                type="text"
                className="form-control"
                value={ender}
                onChange={(e) => setEnder(e.target.value)}
              />
            </div>
            <div className="row">
              <div className="col">
              <label className="form-label"><strong>Telefone</strong></label>
              <input
                type="text"
                className="form-control"
                value={fone}
                onChange={(e) => setFone(e.target.value)}
                />
              </div>
              <div className="col-4">
              <label className="form-label"><strong>Admin</strong></label>
              <input
                type="boolean"
                className={`form-control ${is_admin ? 'admin-yes' : 'admin-no'}`}
                value={is_admin ? 'Sim' : 'Não'}
                onChange={(e) => setIsAdmin(e.target.value)}
                />
                </div>
            </div>
          </div>
        ) : (
          <p>Carregando...</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Fechar</Button>
        <Button variant="success" onClick={handleSave}>Salvar</Button>
      </Modal.Footer>
      <ModalSucesso show={showModalSucesso} onClose={handleSucessoClose} message='Dados Atualizados com sucesso!' />
    </Modal>
  );
};

export default ModalColaboradores;

