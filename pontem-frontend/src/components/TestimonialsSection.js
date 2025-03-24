import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const TestimonialsSection = () => (
  <Container id="testimonials" className="my-5">
    <h2 className="text-center">Lo que dicen nuestros usuarios</h2>
    <Row className="mt-4">
      <Col md={4}>
        <Card className='m-2'>
          <Card.Body>
            <Card.Text>"PlanMate ha revolucionado la manera en que organizo mis reuniones. Todo es más fácil y eficiente." - <strong>Ana G.</strong></Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className='m-2'>
          <Card.Body>
            <Card.Text>"La integración con Google Calendar es simplemente genial. No más conflictos de horarios." - <strong>Carlos M.</strong></Card.Text>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card className='m-2'>
          <Card.Body>
            <Card.Text>"Las herramientas de colaboración nos han permitido ser mucho más productivos en nuestras reuniones." - <strong>Lucía R.</strong></Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
);

export default TestimonialsSection;