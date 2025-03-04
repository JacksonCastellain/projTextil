import React, { useReducer, useState } from 'react';
import { useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import ModalError from '../Modal/ModalError';

const initialState = {
  nome: '',
  cnpj: '',
  ender: '',
  fone: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET_FORM':
      return initialState;
    default:
      throw new Error(`Ação desconhecida: ${action.type}`);
  }
}

const ModalCliente = ({ show, onClose, cliente, onUpdate, mode }) => {
  const [formState, dispatch] = useReducer(reducer, initialState);
  const [showModalError, setShowModalError] = useState(false);

  useEffect(() => {
    if (show) {
      if (mode === 'edit' && cliente) {
        dispatch({ type: 'SET_FIELD', field: 'nome', value: cliente.nome });
        dispatch({ type: 'SET_FIELD', field: 'cnpj', value: cliente.cnpj });
        dispatch({ type: 'SET_FIELD', field: 'ender', value: cliente.ender || '' });
        dispatch({ type: 'SET_FIELD', field: 'fone', value: cliente.fone || '' });
      } else {
        dispatch({ type: 'RESET_FORM' });
      }
    }
  }, [show, cliente, mode]);

  const validateForm = () => {
    if (!formState.nome || !formState.cnpj) {
      alert('Todos os campos são obrigatórios.');
      return false;
    }
    return true;
  };
  
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const url =
        mode === 'edit' && cliente
          ? `http://localhost/server.php?action=updateCliente&id=${cliente.id}`
          : `http://localhost/server.php?action=addCliente`;
      const method = mode === 'edit' ? 'PUT' : 'POST';
  
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
        credentials: 'include',
      });
  
      if (!response.ok) {
        throw new Error('Erro ao salvar cliente');
      }
  
      // Chama onUpdate para atualizar o estado global
      if (mode === 'edit' && cliente) {
        onUpdate({ ...cliente, ...formState }); // Atualiza o cliente existente
      } else {
        const data = await response.json(); // Pega o novo cliente da resposta
        onUpdate(data.cliente); // Adiciona o novo cliente
      }
  
      onClose();
    } catch (error) {
      setShowModalError(true);
      console.error('Erro ao salvar cliente:', error);
    } 
  };

  const ModalErrorClose = () => {
    setShowModalError(false);
  };
   
  const title = mode === 'edit' ? 'Editar Cliente' : 'Novo Cliente'; 

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={(e) => e.preventDefault()}>
          {mode === 'edit' && cliente && (
            <div>
              <label className="form-label">
                <strong>ID</strong>
              </label>
              <input className="form-control" value={cliente.id} readOnly />
            </div>
          )}
          <div>
            <label className="form-label">
              <strong>Nome</strong>
            </label>
            <input
              type="text"
              className="form-control"
              value={formState.nome}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'nome', value: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label">
              <strong>CNPJ</strong>
            </label>
            <input
              type="text"
              className="form-control"
              value={formState.cnpj}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'cnpj', value: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label">
              <strong>Endereço</strong>
            </label>
            <input
              type="text"
              className="form-control"
              value={formState.ender
              }
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'ender', value: e.target.value })}  
            />
          </div>
          <div>
            <label className="form-label">
              <strong>Telefone</strong>
            </label>
            <input
              type="text"
              className="form-control"
              value={formState.fone}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'fone', value: e.target.value })}
            />
          </div>  
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
        <Button variant="success" onClick={handleSave}>
          Salvar
        </Button>
      </Modal.Footer>
      {mode === 'edit' ?(
        <ModalError show={showModalError} onClose={ModalErrorClose} message="Erro ao editar cliente" />
      ) : (
        <ModalError show={showModalError} onClose={ModalErrorClose} message="Erro ao adicionar cliente" />
      )}
    </Modal>
  );
}

export default ModalCliente;