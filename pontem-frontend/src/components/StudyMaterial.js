import React from 'react';
import CaseBook from './CaseBook';
import '../styles/StudyMaterial.css';
import StageFlow from './StageFlow';
import HeaderBanner from './HeaderBanner';

const headerBannerImage = '/LugarEstudio.jpg';

const StudyMaterial = () => {
  const handleClick = () => {
    window.open(
      'https://drive.google.com/drive/folders/1VMvUCSLVQ4ZeAVuzffJVIIHwkJqUGPZ8?usp=drive_link',
      '_blank'
    );
  };

  return (
    <div>
      <HeaderBanner imageSrc={headerBannerImage} title="Material de Estudio" />
      <div className="study-material-section text-center">
        <h1 className="study-material-subtitle mt-5">
          Postulación a Consultoras estratégicas
        </h1>
        <p className="section-text study-material-description">
          La postulación a consultoras estratégicas es un proceso extenso (puede
          durar varios meses) y altamente competitivo. Por ello, una buena
          preparación es clave para avanzar con éxito. Este proceso generalmente
          se divide en las siguientes etapas principales:
        </p>
        <StageFlow />
      </div>
      <div className="study-material-section text-center">
        <h1 className="study-material-subtitle">Link a Drive de Estudio</h1>
        <p>Solicita acceso a nuestro Drive con todo el material de estudio.</p>
        {/* <Button onClick={handleClick} className="study-material-button drive">Acceder a Drive</Button> */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img
            src="drive-logo.png"
            alt="Google Drive Logo"
            onClick={handleClick}
            className="drive-logo"
          />
        </div>
      </div>
      <div className="study-material-casebook">
        <CaseBook />
      </div>
    </div>
  );
};

export default StudyMaterial;
