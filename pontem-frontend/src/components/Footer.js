import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaEnvelope, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom'; // Usamos ScrollLink para el scroll suave

const FooterComponent = () => (
  <footer className="footer text-center">
    <Container>
      <Row className='mb-4'>
        <Col>
          <img
            src="LogoBlanco.png"
            alt="Pontem Consulting Club"
            className="footer-logo"
          />
        </Col>
        <Col className='text-start'>
          <h5>Pontem</h5>
          <ul className="list-unstyled">
            <li>
              <RouterLink to="/">
                Inicio
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/consultoria-social">
                Consultoría Social
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/eventos">
                Eventos
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/noticias">
                Noticias y Blog
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/material-estudio">
                Material de Estudio
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/nosotros">
                Nosotros
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/admin">
                Admin
              </RouterLink>
            </li>
          </ul>
        </Col>
        <Col className='text-start'>
          <h5>Contacto</h5>
          <ul className="list-unstyled">
            <li>
              <a href="mailto:clubconsultoria.uc@gmail.com" className="footer-contact email">
                <FaEnvelope />{' '}
                Email
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/company/pontemcc/mycompany/" target="_blank" rel="noreferrer" className="footer-contact linkedin">
                <FaLinkedin />{' '}
                LinkedIn
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/pontemconsultingclub/" target="_blank" rel="noreferrer" className="footer-contact instagram">
                <FaInstagram />{' '}
                Instagram
              </a>
            </li>
          </ul>
        </Col>
      </Row>
      <p>&copy; 2024 Pontem Consulting Club. Todos los derechos reservados.</p>
      <p>Desarrollado por <a href="https://www.linkedin.com/in/santiago-ernst/" target="_blank" rel="noreferrer">Santiago Ernst</a></p>
    </Container>
  </footer>
);

export default FooterComponent;