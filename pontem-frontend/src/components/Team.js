import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import '../styles/About.css';
import teamData from '../data/Equipos';

function Team() {
  return (
    <Container className="pt-5 team-container">
      <h3 className="about-title">Conoce a nuestro equipo</h3>
      {teamData.map((team, index) => (
        <div key={team.id} className='team-card'>
          <Row
            className={`align-items-center justify-content-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
          >
            <Col md={6} className="">
              <Image src={team.imageUrl} className="team-image" />
            </Col>
            <Col md={6} className="team-content">
              <h3 className='team-title'>{team.name}</h3>
              <p className='team-text'><strong>Integrantes:</strong> {team.members.join(', ')}.</p>
              <p className='team-text'><strong>Función:</strong> {team.role}</p>
            </Col>
          </Row>
        </div>
      ))}
    </Container>
  );
}

export default Team;