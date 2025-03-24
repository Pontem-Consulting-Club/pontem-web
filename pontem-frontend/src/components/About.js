import React from 'react';
import History from './History';
import Team from './Team';
import HeaderBanner from './HeaderBanner';

const headerBannerImage = '/Equipo2024.jpeg';

function About() {
  return (
    <div>
        <HeaderBanner imageSrc={headerBannerImage} title="Nosotros" />
        <History/>
        <Team/>
    </div>
  );
}

export default About;