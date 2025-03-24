import React, { useState } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import NavbarToggle from './NavbarToggle';
import { Link as RouterLink } from 'react-router-dom';
import '../styles/Navbar.css';
import '../App.css';

function NavbarPontem() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary fixed-top shadow-navbar">
        <Container fluid className="d-flex justify-content-between">
          <Navbar.Brand href="/" className="mx-auto d-lg-none position-absolute custom-start-48 translate-middle-x">
            <img
              src="/pontemog_optimized_.png"
              alt="Pontem"
              className="d-inline-block align-top"
            />
          </Navbar.Brand>
          <Navbar.Brand href="/" className="d-none d-lg-block">
            <img
              src="/pontemog_optimized_.png"
              alt="Pontem"
              className="d-inline-block align-top"
            />
          </Navbar.Brand>
          <NavbarToggle toggleNavbar={toggleNavbar} isOpen={isOpen} />
          <Navbar.Collapse className={`justify-content-end ${isOpen ? 'show' : ''}`}>
            <Nav className="me-auto">
              <RouterLink to="/" className="nav-link">
                Inicio
              </RouterLink>
              <RouterLink to="/consultoria-social" className="nav-link">
                Consultoría Social
              </RouterLink>
              <RouterLink to="/eventos" className="nav-link">
                Eventos
              </RouterLink>
              <RouterLink to="/noticias" className="nav-link">
                Noticias y Blog
              </RouterLink>
              <RouterLink to="/material-estudio" className="nav-link">
                Material de Estudio
              </RouterLink>
              <RouterLink to="/nosotros" className="nav-link">
                Nosotros
              </RouterLink>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className={`navbar-collapse ${isOpen ? 'open' : ''}`} id="navbarScroll">
        <Nav className="flex-column">
          <RouterLink to="/" className="nav-link" onClick={toggleNavbar}>
            Inicio
          </RouterLink>
          <RouterLink to="/consultoria-social" className="nav-link" onClick={toggleNavbar}>
            Consultoría Social
          </RouterLink>
          <RouterLink to="/eventos" className="nav-link" onClick={toggleNavbar}>
            Eventos
          </RouterLink>
          <RouterLink to="/noticias" className="nav-link" onClick={toggleNavbar}>
            Noticias y Blog
          </RouterLink>
          <RouterLink to="/material-estudio" className="nav-link" onClick={toggleNavbar}>
            Material de Estudio
          </RouterLink>
          <RouterLink to="/nosotros" className="nav-link" onClick={toggleNavbar}>
            Nosotros
          </RouterLink>
        </Nav>
      </div>

      {isOpen && <div className="overlay" onClick={toggleNavbar}></div>}
    </>
  );
}

export default NavbarPontem;