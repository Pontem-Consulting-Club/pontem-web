import React from 'react';
import { Container, Button } from 'react-bootstrap';

import "../App.css";

const ContactSection = () => (
  <Container id="contact" className="text-center my-3">
    <h4>¿Tienes preguntas? Estamos aquí para ayudarte.</h4>
    <Button className='btn-outline-custom' size="lg">Contáctanos</Button>
  </Container>
);

export default ContactSection;