import React from 'react';
import { Carousel, Button, Container } from 'react-bootstrap';
import { Link as RouterLink } from 'react-router-dom';
import slides from '../data/Portadas';
import '../App.css';

const IntroductionSection = () => {
  return (
    <Carousel id="intro" fade>
      {slides.map(slide => (
        <Carousel.Item key={slide.id}>
          <div className="introduction-section" style={{ '--background-image': `url(${slide.imageUrl})` }}>
            <Container className="content text-white d-flex flex-column h-100 justify-content-center">
              <h1 className="text-bold intro-margin">{slide.title}</h1>
              <h5 className="intro-margin">{slide.subtitle}</h5>
              <RouterLink to={slide.link}>
                <Button className="btn-custom mt-3 intro-margin" size="lg">
                  {slide.buttonText}
                </Button>
              </RouterLink>
            </Container>
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default IntroductionSection;