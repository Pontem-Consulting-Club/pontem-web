import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { FaDownload } from 'react-icons/fa';
import { MdFullscreen } from 'react-icons/md';
import '../styles/CaseBook.css';

const CaseBook = () => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/docs/Casebook_Pontem_2021.pdf';
    link.download = 'CaseBook.pdf';
    link.click();
  };

  const handleFullScreen = () => {
    window.open('/docs/Casebook_Pontem_2021.pdf', '_blank');
  };

  return (
    <Container className="casebook-container">
      <h1 className="casebook-title">Descarga nuestro Case Book</h1>
      <div className='casebook-buttons'>
        <Button className="btn-custom casebook-button-download" onClick={handleDownload}>
          Descargar PDF
          <FaDownload className="icon-spacing"/>
        </Button>
        <Button className="btn-custom casebook-button-fullscreen" onClick={handleFullScreen}>
          Ver CaseBook
          <MdFullscreen className="icon-spacing" />
        </Button>
      </div>

      {/* Previsualización del PDF */}
      <div className="pdf-preview">
        <iframe
          src="/docs/Casebook_Pontem_2021.pdf"
          title="Previsualización del Case Book"
          width="100%"
          height="500px"
        ></iframe>
      </div>
    </Container>
  );
};

export default CaseBook;