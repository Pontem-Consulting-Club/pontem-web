import React from 'react';
import { Container, Row, Col, Image, Card } from 'react-bootstrap';
import '../styles/About.css';
import historyData from '../data/Historia';

const History = () => {
  return (
    <Container className='mt-3'>
      {/* Sección de Nuestra Historia */}
      <Row className='justify-content-center text-center'>
        <Col md={8}>
          <h3 className='about-title'>Nuestra Historia</h3>
        </Col>
      </Row>
      <Row className='align-items-center justify-content-center'>
        <Col md={6}>
          <Image src='/Jornada_Pontem.JPG' fluid className='history-image' />
        </Col>
        <Col md={6}>
          <div className='section-text'>
            <p>{historyData.history1}</p>
            <p>{historyData.history2}</p>
          </div>
        </Col>
      </Row>

      {/* Sección de Visión y Misión */}
      <Row className='justify-content-center text-center mt-3'>
        <Col md={8}>
          <h3 className='about-title'>Visión y Misión</h3>
        </Col>
      </Row>
      <Row className='justify-content-center'>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Visión</Card.Title>
              <Card.Text>{historyData.vision}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Misión</Card.Title>
              <Card.Text>{historyData.mision}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default History;