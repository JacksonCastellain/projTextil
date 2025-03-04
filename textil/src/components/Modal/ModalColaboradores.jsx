import React, { useEffect, useReducer, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import ModalError from '../Modal/ModalError';

// Definição do Reducer
const initialState = {
  nome: '',
  cpf: '',
  senha: '',
  ender: '',
  fone: '',
  is_admin: false,
};

function formReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET_FORM':
      return initialState;
    default:
      throw new Error(`Ação desconhecida: ${action.type}`);
  }
}

const ModalColaboradores = ({ show, onClose, colaborador, onUpdate, mode }) => {
  const [formState, dispatch] = useReducer(formReducer, initialState);
  const [showModalError, setShowModalError] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && colaborador) {
      dispatch({ type: 'SET_FIELD', field: 'nome', value: colaborador.nome });
      dispatch({ type: 'SET_FIELD', field: 'cpf', value: colaborador.cpf });
      dispatch({ type: 'SET_FIELD', field: 'ender', value: colaborador.ender || '' });
      dispatch({ type: 'SET_FIELD', field: 'fone', value: colaborador.fone || '' });
      dispatch({ type: 'SET_FIELD', field: 'is_admin', value: colaborador.is_admin });
    } else {
      dispatch({ type: 'RESET_FORM' });
    }
  }, [show, colaborador, mode]);

  const handleSave = async () => {
    try {
      const url =
        mode === 'edit' && colaborador
          ? `http://localhost/server.php?action=updateColaborador&id=${colaborador.id}`
          : `http://localhost/server.php?action=addColaborador`;
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formState),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar colaborador");
      }

      if (mode === 'edit' && colaborador) {
        onUpdate({ ...colaborador, ...formState });
      } else {
        const data = await response.json();
        onUpdate(data.colaborador);
      }

      onClose();
    } catch (error) {
      setShowModalError(true);
      console.error('Erro ao salvar colaboradores:', error);
    }
  };

  const ModalErrorClose = () => {
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
              <label className="form-label">
                <strong>ID</strong>
              </label>
              <input type="text" className="form-control" value={colaborador.id} readOnly />
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
              <strong>CPF</strong>
            </label>
            <input
              type="text"
              className="form-control"
              value={formState.cpf}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'cpf', value: e.target.value })}
            />
          </div>
          {mode !== 'edit' && (
            <div>
              <label className="form-label">
                <strong>Senha</strong>
              </label>
              <input
                type="password"
                className="form-control"
                value={formState.senha}
                onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'senha', value: e.target.value })}
              />
            </div>
          )}
          <div>
            <label className="form-label">
              <strong>Endereço</strong>
            </label>
            <input
              type="text"
              className="form-control"
              value={formState.ender}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'ender', value: e.target.value })}
            />
          </div>
          <div className="row">
            <div className="col">
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
            <div className="col-4">
              <label className="form-label">
                <strong>Admin</strong>
              </label>
              <select
                className="form-select"
                value={formState.is_admin.toString()}
                onChange={(e) =>
                  dispatch({ type: 'SET_FIELD', field: 'is_admin', value: e.target.value === 'true' })
                }
              >
                <option value="false">Não</option>
                <option value="true">Sim</option>
              </select>
            </div>
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
      {mode === 'edit' ? (
        <ModalError show={showModalError} onClose={ModalErrorClose} message="Erro ao atualizar Colaborador." />
      ) : (
        <ModalError show={showModalError} onClose={ModalErrorClose} message="Erro ao incluir colaborador." />
      )}
    </Modal>
  );
};

export default ModalColaboradores;