import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import '../styles/SocialConsulting.css';
import socialConsultingData from '../data/ConsultoriaSocial';
import api from '../api';
import { createClient } from '@supabase/supabase-js';
import Spinner from './Spinner';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

function Projects() {
  const [cardsData, setCardsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCardsData = async () => {
      try {
        const response = await api.get('/projects/social-consulting');
        const data = response.data;

        // Fetch images from Supabase
        const updatedData = await Promise.all(
          data.map(async (project) => {
            const { data: imageData, error } = await supabase.storage
              .from('images')
              .download(project.image_url);

            if (error) {
              console.error('Error fetching image:', error);
              return project;
            }

            const imageUrl = URL.createObjectURL(imageData);
            return { ...project, imageUrl };
          })
        );

        setCardsData(updatedData);
      } catch (error) {
        console.error('Error fetching cards data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCardsData();
  }, []);

  return (
    <Container className="py-5 projects-container">
      {isLoading ? (
        <Spinner />
      ) : (
        <Col className="justify-content-center mb-5">
          <Row className="justify-content-center align-items-center">
            <Col md={6}>
              <div className="section-text">
                <h3 className="cs-title">{socialConsultingData.title}</h3>
                <p>{socialConsultingData.text1}</p>
                <p>{socialConsultingData.text2}</p>
              </div>
            </Col>
            <Col md={6}>
              <Image src={'/BienvenidaConsultores.jpg'} className="cs-image" fluid />
            </Col>
          </Row>
        </Col>
      )}
      {!isLoading && cardsData.map((project, index) => (
        <div key={project.id} className='project-card'>
          <Row
            className={`align-items-center justify-content-center ${index % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <Col md={6} className="project-image-container">
              <Image src={project.imageUrl} className="project-image" />
            </Col>
            <Col md={6} className="project-content">
              <h3 className='project-title'>{project.title}</h3>
              <h5 className='project-subtitle'>{project.subtitle}</h5>
              <p className='project-text'>{project.description}</p>
              <a
                className='project-link'
                href={project.link}
                target='_blank'
                rel='noopener noreferrer'
                tabIndex={-1}
              >
                {project.link_text}
              </a>
            </Col>
          </Row>
        </div>
      ))}
    </Container>
  );
}

export default Projects;