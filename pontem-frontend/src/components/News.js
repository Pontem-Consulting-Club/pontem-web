import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/News.css';
import Spinner from './Spinner';
import HeaderBanner from './HeaderBanner';
import Pagination from './Pagination';
import api from '../api';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const headerBannerImage = '/ActividadSumma.JPG';

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

function calculateTimeAgo(publishDate) {
  const now = new Date();
  const published = new Date(publishDate);
  const timeDiff = Math.abs(now - published);
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) return 'Hoy';
  if (daysDiff === 1) return 'Hace 1 día';
  if (daysDiff < 7) return `Hace ${daysDiff} días`;
  const weeksDiff = Math.floor(daysDiff / 7);
  if (weeksDiff === 1) return 'Hace 1 semana';
  return `Hace ${weeksDiff} semanas`;
}

function News() {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newsData, setNewsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 6;

  const handleTypeChange = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(
        selectedTypes.filter((selectedType) => selectedType !== type)
      );
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
    setCurrentPage(1); // Reset page to 1 when filters change
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await api.get('/news/news');
        const sortedNews = response.data.sort(
          (a, b) => new Date(b.published_date) - new Date(a.published_date)
        );

        // Fetch images from Supabase
        const updatedNews = await Promise.all(
          sortedNews.map(async (newsItem) => {
            if (!newsItem.image_url) {
              console.warn(
                `La noticia con ID ${newsItem.id} no tiene una URL de imagen.`
              );
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

  const filteredNews =
    selectedTypes.length > 0
      ? newsData.filter((newsItem) => selectedTypes.includes(newsItem.type))
      : newsData;

  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = filteredNews.slice(indexOfFirstNews, indexOfLastNews);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <HeaderBanner imageSrc={headerBannerImage} title="Noticias y Blog" />
      <Container className="news-container py-5">
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            {/* Texto de instrucción */}
            <Row className="justify-content-start">
              <Col md={8}>
                <p className="text-instruction">
                  Selecciona las noticias que deseas ver:
                </p>
              </Col>
            </Row>

            {/* Sección de Filtros */}
            <Row className="justify-content-start mb-4">
              <Col md={12} className="d-flex flex-wrap">
                {['Evento', 'Artículo', 'Anuncio'].map((type) => {
                  const isSelected = selectedTypes.includes(type);
                  return (
                    <div
                      key={type}
                      className={`news-type ${
                        isSelected
                          ? 'news-type-selected'
                          : 'news-type-unselected'
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
                      onClick={() => handleTypeChange(type)}
                    >
                      {type}
                    </div>
                  );
                })}
              </Col>
            </Row>

            {/* Sección de Noticias */}
            <Row className="news-grid">
              {currentNews.map((newsItem) => (
                <Col key={newsItem.id}>
                  <Card className="news-card mb-4">
                    <Card.Img
                      variant="top"
                      src={newsItem.imageUrl}
                      className="news-image"
                    />
                    <Card.Body className="d-flex flex-column justify-content-between">
                      <div
                        className="news-type"
                        style={{
                          backgroundColor: getTypeColor(newsItem.type),
                          color: getTypeColor(newsItem.type).replace('2a', ''),
                        }}
                      >
                        {newsItem.type}
                      </div>
                      <Card.Title className="news-item-title">
                        {newsItem.title}
                      </Card.Title>
                      <Card.Text className="news-item-subtitle">
                        {newsItem.subtitle}
                      </Card.Text>
                      <div className="d-flex justify-content-between align-items-end mt-auto">
                        <div className="flex-grow-1">
                          <Card.Subtitle className="news-item-author text-muted">
                            Por <strong>{newsItem.author}</strong>
                          </Card.Subtitle>
                          <Card.Text className="news-item-time text-muted">
                            {calculateTimeAgo(newsItem.published_date)}
                          </Card.Text>
                        </div>
                        <div>
                          <Button
                            className="btn-custom btn-news"
                            as={Link}
                            to={`/noticias/${newsItem.id}`}
                          >
                            Leer más
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            <Pagination
              newsPerPage={newsPerPage}
              totalNews={filteredNews.length}
              paginate={paginate}
              currentPage={currentPage}
            />
          </>
        )}
      </Container>
    </>
  );
}

export default News;
export { getTypeColor, calculateTimeAgo };
