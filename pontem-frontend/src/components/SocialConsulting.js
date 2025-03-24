import React from 'react';
import SCProjects from './SCProjects';
import HeaderBanner from './HeaderBanner';
import '../styles/SocialConsulting.css';

const headerBannerImage = '/BienvenidaConsultores.jpg';

function CS() {
  return (
  <div>
    <HeaderBanner imageSrc={headerBannerImage} title="Consultoría Social" />
    <SCProjects />
  </div>
  );
}

export default CS;