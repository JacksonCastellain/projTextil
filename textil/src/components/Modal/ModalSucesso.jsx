import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ModalSucesso = ({ show, onClose, message = "Operação concluída com sucesso!" }) => {
  return (
    <Modal show={show} onHide={onClose} centered >
      <Modal.Header closeButton>
      </Modal.Header>
      <Modal.Body className='text-center'>
        <img src="\img\success.png"  alt="Sucesso" className='text-center w-50' />
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer className='justify-content-center'>
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalSucesso;
