import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/Admin.css';
import consultorasData from '../data/Consultoras';
import { createClient } from '@supabase/supabase-js';

import api from '../api';
import { getTypeColor } from './News';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

function NewCardForm({ type, onSave, onCancel }) {
  const [eventData, setEventData] = useState({
    date: new Date(),
    title: '',
    subtitle: '',
    location: '',
    link: '',
    description: '',
    image_url: '',
  });

  const [projectData, setProjectData] = useState({
    title: '',
    subtitle: '',
    description: '',
    link_text: '',
    link: '',
    image_url: '',
  });

  const [newsData, setNewsData] = useState({
    title: '',
    subtitle: '',
    type: '',
    author: '',
    content: '',
    image_url: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  const handleChange = async (e) => {
    const { name, value } = e.target;
    if (type === 'events') {
      if (name === 'subtitle') {
        const selectedConsultora = consultorasData.find(
          (consultora) => consultora.nombre === value
        );

        let imageUrl = eventData.image_url;
        if (selectedConsultora) {
          const { data: imageData, error } = await supabase.storage
            .from('images')
            .download(selectedConsultora.image_url);

          if (error) {
            console.error('Error al obtener la imagen:', error);
          } else {
            imageUrl = URL.createObjectURL(imageData);
            setPreviewImageUrl(imageUrl);
          }
        }

        setEventData({
          ...eventData,
          [name]: value,
          image_url: selectedConsultora?.image_url || '',
        });
      } else {
        setEventData({
          ...eventData,
          [name]: value,
        });
      }
    } else if (type === 'projects') {
      setProjectData({
        ...projectData,
        [name]: value,
      });
    } else if (type === 'news') {
      setNewsData({
        ...newsData,
        [name]: value,
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log('Archivo seleccionado:', file);
    setImageFile(file);
  };

  const handleDateChange = (date) => {
    if (type === 'events') {
      setEventData({
        ...eventData,
        date: date,
      });
    }
  };

  const handleTypeSelect = (type) => {
    setSelectedType((prevType) => (prevType === type ? '' : type));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = '';
    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append('file', imageFile);

        const response = await api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const result = response.data;
        imageUrl = result.filePath;
      } catch (error) {
        console.error('Error al subir la imagen:', error);
        return;
      }
    }

    let formDataWithTimestamp;
    if (type === 'events') {
      formDataWithTimestamp = {
        ...eventData,
        image_url: eventData.image_url,
        date: eventData.date.toISOString(),
      };
    } else if (type === 'projects') {
      formDataWithTimestamp = {
        ...projectData,
        image_url: imageUrl || projectData.image_url,
      };
    } else if (type === 'news') {
      formDataWithTimestamp = {
        ...newsData,
        type: selectedType,
        image_url: imageUrl || newsData.image_url,
        published_date: new Date().toISOString(),
      };
    }

    console.log('Datos enviados:', formDataWithTimestamp);

    const savedData = await onSave(formDataWithTimestamp, type);
    console.log('Datos recibidos de vuelta:', savedData);

    if (type === 'news' && savedData && savedData.id) {
      formDataWithTimestamp.link = `/noticias/${savedData.id}`;
    }
  };

  return (
    <Card className="new-card-form">
      <h4 className="form-title">
        Crear{' '}
        {type === 'events'
          ? 'nuevo Evento'
          : type === 'news'
          ? 'nueva Noticia'
          : 'nuevo Proyecto'}
      </h4>
      <form onSubmit={handleSubmit}>
        {type === 'events' && (
          <>
            <input
              type="text"
              name="title"
              placeholder="Título del Evento"
              onChange={handleChange}
              required
            />
            <select
              className="consultora-select"
              name="subtitle"
              onChange={handleChange}
              value={eventData.subtitle}
            >
              <option value="">Selecciona una empresa</option>
              {consultorasData.map((consultora) => (
                <option key={consultora.id} value={consultora.nombre}>
                  {consultora.nombre}
                </option>
              ))}
            </select>
            {previewImageUrl && (
              <img
                className="consultora-logo"
                src={previewImageUrl}
                alt={`Logo de ${eventData.subtitle}`}
              />
            )}
            <textarea
              name="description"
              placeholder="Descripción"
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="location"
              placeholder="Lugar"
              onChange={handleChange}
              required
            />
            <input
              type="url"
              name="link"
              placeholder="Link de Inscripción"
              onChange={handleChange}
              required
            />
            <DatePicker
              selected={eventData.date}
              onChange={handleDateChange}
              className="date-picker"
              showTimeSelect
              timeIntervals={5}
              dateFormat="Pp"
              placeholderText="Selecciona Fecha y Hora"
              required
            />
          </>
        )}
        {type === 'projects' && (
          <>
            <input
              type="text"
              name="title"
              placeholder="Nombre del Proyecto"
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="subtitle"
              placeholder="Subtítulo o slogan"
              onChange={handleChange}
              required
            />
            <textarea
              name="description"
              placeholder="Descripción"
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="link_text"
              placeholder='Texto del Link (Ej: "Más información")'
              onChange={handleChange}
              required
            />
            <input
              type="url"
              name="link"
              placeholder="Link del Proyecto"
              onChange={handleChange}
              required
            />
            <div className="file-upload-container">
              <label htmlFor="file-upload" className="file-label">
                Sube una portada para tu proyecto:
              </label>
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="file-input"
                required
              />
            </div>
            {projectData.image_url && (
              <img
                className="consultora-logo"
                src={projectData.image_url}
                alt="Portada del Proyecto"
              />
            )}
          </>
        )}
        {type === 'news' && (
          <>
            <input
              type="text"
              name="title"
              placeholder="Título de la Noticia"
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="subtitle"
              placeholder="Subtítulo"
              onChange={handleChange}
              required
            />
            <label className="type-label">Seleccionar tipo:</label>
            <div className="news-type-selector">
              {['Evento', 'Artículo', 'Anuncio'].map((type) => {
                const isSelected = selectedType === type;
                return (
                  <div
                    key={type}
                    className={`news-type ${
                      isSelected ? 'news-type-selected' : 'news-type-unselected'
                    }`}
                    style={{
                      backgroundColor: isSelected
                        ? getTypeColor(type).replace('2a', '')
                        : getTypeColor(type),
                      color: isSelected
                        ? 'white'
                        : getTypeColor(type).replace('2a', ''),
                      cursor: 'pointer',
                    }}
                    onClick={() => handleTypeSelect(type)}
                  >
                    {type}
                  </div>
                );
              })}
            </div>
            <input
              type="text"
              name="author"
              placeholder="Autor"
              onChange={handleChange}
              required
            />
            <textarea
              name="content"
              placeholder="Contenido"
              onChange={handleChange}
              required
            />
            <div className="file-upload-container">
              <label htmlFor="file-upload" className="file-label">
                Sube una portada para tu noticia:
              </label>
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="file-input"
                required
              />
            </div>
            {newsData.image_url && (
              <img
                className="consultora-logo"
                src={newsData.image_url}
                alt="Portada de la Noticia"
              />
            )}
          </>
        )}
        <div className="form-buttons">
          <button className="btn-custom btn-crear" type="submit">
            Crear
          </button>
          <button
            className="btn-custom btn-cancelar"
            type="button"
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </form>
    </Card>
  );
}

export default NewCardForm;
