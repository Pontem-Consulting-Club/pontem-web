import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const FeaturesSection = () => (
  <Container id="features" className="my-5">
    <h2 className="text-center">Funcionalidades Principales</h2>
    <Row className="mt-4">
      <Col md={4}>
        <Card className='m-2'>
          <Card.Img variant="top" src="/Reunion.jpeg" />
          <Card.Body>
            <Card.Title>Gestión de Reuniones</Card.Title>
            <div>
              <ul>
                <li><strong>Crea y Programa:</strong> Organiza tus reuniones con facilidad, elige fecha, hora y lugar.</li>
                <li><strong>Invitaciones Automáticas:</strong> Envía invitaciones directamente desde la plataforma a través de email o Google Calendar.</li>
                <li><strong>Recordatorios:</strong> Recibe notificaciones y recordatorios para nunca olvidar una reunión importante.</li>
              </ul>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className='m-2'>
          <Card.Img variant="top" src="/Horarios.webp" />
          <Card.Body>
            <Card.Title>Coordinación de Horarios</Card.Title>
            <div>
              <ul>
                <li><strong>Disponibilidad en Tiempo Real:</strong> Sincroniza tu calendario y visualiza la disponibilidad de todos los participantes.</li>
                <li><strong>Bloqueo de Horarios:</strong> Reserva tiempos específicos para reuniones y evita conflictos de horario.</li>
                <li><strong>Integración con Google Calendar:</strong> Conecta tu cuenta de Google para una gestión fluida de tu agenda.</li>
              </ul>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className='m-2'>
        <Card.Img variant="top" src="/Colaboracion.jpeg" />
          <Card.Body>
            <Card.Title>Colaboración y Comunicación</Card.Title>
            <div>
              <ul>
                <li><strong>Chat Integrado:</strong> Comunica y coordina detalles importantes directamente en la plataforma.</li>
                <li><strong>Compartir Documentos:</strong> Comparte archivos y documentos necesarios para tus reuniones.</li>
                <li><strong>Notas y Seguimientos:</strong> Toma notas y crea seguimientos post-reunión para mantener el orden y la claridad.</li>
              </ul>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default FeaturesSection;