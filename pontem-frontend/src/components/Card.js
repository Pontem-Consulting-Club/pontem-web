import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import '../styles/Admin.css';
import { getTypeColor } from './News';

function Card({ item, type, onEdit, onDelete }) {
  const renderContent = () => {
    const backgroundColor = getTypeColor(item.type);
    const color = getTypeColor(item.type).replace('2a', '');

    switch (type) {
      case 'event':
        return (
          <div className='flex justify-between'>
            <div className="card-content">
              <img src={item.imageUrl} alt={item.title} className="card-image" />
              <div>
                <h3 className='card-title'>{item.title}</h3>
                <h4 className='card-subtitle'>{item.subtitle}</h4>
                <p className='card-date'>{new Date(item.date).toLocaleString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })} - {new Date(item.date).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <div className="card-buttons">
              <button onClick={onEdit} className="edit-button">
                <FontAwesomeIcon icon={faEdit} className="icon-edit" />
              </button>
              <button onClick={onDelete} className="delete-button">
                <FontAwesomeIcon icon={faTrash} className="icon-delete" />
              </button>
            </div>
          </div>
        );
      case 'project':
        return (
          <div className='flex justify-between'>
            <div>
              <h3 className='card-title'>{item.title}</h3>
              <h4 className='card-subtitle'>{item.subtitle}</h4>
            </div>
            <div className="card-buttons">
              <button onClick={onEdit} className="edit-button">
                <FontAwesomeIcon icon={faEdit} className="icon-edit" />
              </button>
              <button onClick={onDelete} className="delete-button">
                <FontAwesomeIcon icon={faTrash} className="icon-delete" />
              </button>
            </div>
          </div>
        );
      case 'news':
        return (
          <div className='flex justify-between'>
            <div>
              <h3 className='card-title'>{item.title}</h3>
              <p className='card-type' style={{ backgroundColor: backgroundColor, color: color }}>{item.type}</p>
              <p className='card-author'>{item.author}</p>
              <p className='card-date'>{new Date(item.published_date).toLocaleString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })} - {new Date(item.published_date).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="card-buttons">
              <button onClick={onEdit} className="edit-button">
                <FontAwesomeIcon icon={faEdit} className="icon-edit" />
              </button>
              <button onClick={onDelete} className="delete-button">
                <FontAwesomeIcon icon={faTrash} className="icon-delete" />
              </button>
            </div>
          </div>
        );
      default:
        return <h3>{item.title}</h3>;
    }
  };

  return (
    <div className="card">
      {renderContent()}
    </div>
  );
}

export default Card; 