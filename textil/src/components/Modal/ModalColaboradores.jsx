import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import ModalError from '../Modal/ModalError';

const ModalColaboradores = ({ show, onClose, colaborador, onUpdate, mode }) => {
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [ender, setEnder] = useState('');
  const [fone, setFone] = useState('');
  const [is_admin, setIsAdmin] = useState(false);
  const [showModalError, setShowModalError] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && colaborador) {
      setNome(colaborador.nome);
      setEnder(colaborador.ender);
      setFone(colaborador.fone);
      setIsAdmin(colaborador.is_admin);
    } else {
      setNome('');
      setSenha('');
      setEnder('');
      setFone('');
      setIsAdmin(false);
    }
  }, [colaborador, mode]);

  const handleSave = async () => {
    try {
      const url = mode === 'edit' && colaborador
        ? `http://localhost/server.php?action=updateColaborador&id=${colaborador.id}`
        : `http://localhost/server.php?action=addColaborador`;

      const method = mode === 'edit' ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome, senha, ender, fone, is_admin }),
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();

      if (mode === 'edit' && colaborador) {
        onUpdate({ ...colaborador, nome, ender, fone, is_admin });
      }
  
      if (mode === 'add') {
        onUpdate({ id: result.id, nome, senha, ender, fone, is_admin });
      }

      onClose();
    } catch (error) {
      setShowModalError(true);
      console.error("Erro na requisição:", error);
    }
  };

  const ModalerrorClose = () => {
    setShowModalError(false);
  };

  const title = mode === 'edit' ? 'Editar Colaborador' : 'Incluir Colaborador';

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={(e) => e.preventDefault()}>
          {mode === 'edit' && colaborador && (
            <div>
              <label className="form-label"><strong>ID</strong></label>
              <input type="text" className="form-control" value={colaborador.id} readOnly />
            </div>
          )}
          <div>
            <label className="form-label"><strong>Nome</strong></label>
            <input
              type="text"
              className="form-control"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          {mode !== 'edit' && (
            <div>
              <label className="form-label"><strong>Senha</strong></label>
              <input 
                type="password" 
                className="form-control"
                value={senha}
                onChange={(e) => setSenha(e.target.value)} 
              />
            </div>
          )}
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
              <select
                className="form-select"
                value={is_admin.toString()}
                onChange={(e) => setIsAdmin(e.target.value === 'true')}
              >
                <option value="false">Não</option>
                <option value="true">Sim</option>
              </select>
            </div>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Fechar</Button>
        <Button variant="success" onClick={handleSave}>Salvar</Button>
      </Modal.Footer>
      {mode === 'edit' ? (
        <ModalError show={showModalError} onClose={ModalerrorClose} message='Erro ao atualizar Colaborador.'/>
      ) : (
        <ModalError show={showModalError} onClose={ModalerrorClose} message='Erro ao incluir colaborador.'/>
      )}
    </Modal>
  );
};

export default ModalColaboradores;

