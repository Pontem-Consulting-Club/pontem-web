import React from 'react';
import '../styles/Admin.css';

function ConfirmationModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <p className="modal-message">{message}</p>
        <div className="modal-buttons">
          <button className="modal-button modal-button-cancel" onClick={onClose}>Cancelar</button>
          <button className="modal-button modal-button-confirm" onClick={onConfirm}>Borrar</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal; 