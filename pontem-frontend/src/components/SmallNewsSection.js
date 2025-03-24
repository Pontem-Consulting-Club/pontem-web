import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/SmallNewsSection.css';
import api from '../api';
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

function SmallNewsSection() {
  const navigate = useNavigate();
  const [newsData, setNewsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await api.get('/news/news');
        const sortedNews = response.data
          .sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate))
          .slice(0, 3);

        const updatedNews = await Promise.all(
          sortedNews.map(async (newsItem) => {
            if (!newsItem.image_url) {
              console.warn(`La noticia con ID ${newsItem.id} no tiene una URL de imagen.`);
              return newsItem;
            }

            const { data: imageData, error } = await supabase.storage
              .from('images')
              .download(newsItem.image_url);

            if (error) {
              console.error('Error al obtener la imagen:', error);
              return newsItem;
            }

            const imageUrl = URL.createObjectURL(imageData);
            return { ...newsItem, imageUrl };
          })
        );

        setNewsData(updatedNews);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleClick = (id) => {
    navigate(`/noticias/${id}`);
  };

  return (
    <Container>
      <h2 className="small-news-section-title">Últimas noticias</h2>
      <Row className="small-news-grid">
        {isLoading ? (
          <div>Cargando...</div>
        ) : (
          newsData.map((newsItem) => (
            <Col key={newsItem.id}>
              <Card
                className="small-news-card mb-4"
                onClick={() => handleClick(newsItem.id)}
                style={{ cursor: 'pointer' }}
              >
                <Card.Img variant="top" src={newsItem.imageUrl} className="small-news-image" />
                <Card.Body>
                  <Row md={12}>
                    <Col md={9}>
                      <Card.Title className="small-news-item-title">{newsItem.title}</Card.Title>
                    </Col>
                    <Col md={3}>
                      <div
                        className="small-news-type"
                        style={{
                          backgroundColor: getTypeColor(newsItem.type),
                          color: getTypeColor(newsItem.type).replace('2a', ''),
                        }}
                      >
                        {newsItem.type}
                      </div>
                    </Col>
                  </Row>
                  <Card.Text className="small-news-item-subtitle">{newsItem.subtitle}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
}

export default SmallNewsSection; 