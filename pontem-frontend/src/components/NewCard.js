import React from 'react';
import '../styles/Admin.css';
import { Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

function NewCard({ type, onNewItem }) {
  return (
    <Card 
      className="new-card" 
      onClick={() => onNewItem(type)}
    >
      <div className='flex items-center justify-center'>
        {type === 'events' ? 'Nuevo Evento' : type === 'news' ? 'Nueva Noticia' : 'Nuevo Proyecto'} <FontAwesomeIcon icon={faPlus} style={{ color: '#888', marginLeft: '10px' }} />
      </div>
    </Card>
  );
}

export default NewCard; 