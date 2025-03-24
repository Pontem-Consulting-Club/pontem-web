import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../styles/NewsDetail.css';
import api from '../api';
import Spinner from './Spinner';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

function getTypeColor(type) {
  switch (type) {
    case 'Evento':
      return '#00bfa32a';
    case 'Artículo':
      return '#ff421d2a';
    case 'Anuncio':
      return '#3d07842a';
    default:
      return '#6c757d2a';
  }
}

function NewsDetail() {
  const { id } = useParams();
  const [newsItem, setNewsItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNewsItem = async () => {
      try {
        const response = await api.get(`/news/news/${id}`);
        let newsData = response.data;

        if (newsData.image_url) {
          const { data: imageData, error } = await supabase.storage
            .from('images')
            .download(newsData.image_url);

          if (error) {
            console.error('Error al obtener la imagen:', error);
          } else {
            const imageUrl = URL.createObjectURL(imageData);
            newsData = { ...newsData, imageUrl };
          }
        }

        setNewsItem(newsData);
      } catch (error) {
        console.error('Error fetching news item:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewsItem();
  }, [id]);

  if (isLoading) {
    return <Spinner />;
  }

  if (!newsItem) {
    return <div>Noticia no encontrada</div>;
  }

  return (
    <div className="news-detail">
      <button onClick={() => navigate(-1)} className="btn-custom back-button">
        <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: '8px' }} />
        Volver
      </button>
      <div className="news-detail-content">
        <h1 className="news-detail-title">{newsItem.title}</h1>
        <p className="news-detail-subtitle">{newsItem.subtitle}</p>
        <div
          className="news-detail-type"
          style={{
            backgroundColor: getTypeColor(newsItem.type),
            color: getTypeColor(newsItem.type).replace('2a', ''),
          }}
        >
          {newsItem.type}
        </div>
        <p className="news-detail-author">
          Por <strong>{newsItem.author}</strong>
        </p>
        <p className="news-detail-date">
          {new Date(newsItem.published_date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        {newsItem.imageUrl && (
          <img
            src={newsItem.imageUrl}
            alt={newsItem.title}
            className="news-detail-image"
          />
        )}
        <p className="news-detail-content-text">{newsItem.content}</p>
      </div>
    </div>
  );
}

export default NewsDetail;
