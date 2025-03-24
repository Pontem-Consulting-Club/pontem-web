import React from 'react';
import '../styles/HeaderBanner.css';

import { useEffect } from 'react';

const HeaderBanner = ({ imageSrc, title }) => {
  useEffect(() => {
    const handleScroll = () => {
      const bannerImage = document.querySelector('.header-banner-image');
      const bannerTitle = document.querySelector('.header-banner-title');
      if (bannerImage && bannerTitle) {
        const scrollPosition = window.scrollY;
        const imageTranslation = scrollPosition * 0.75;
        bannerImage.style.transform = `translateY(${imageTranslation}px)`;

        const titleTranslation = scrollPosition * 0.5;
        bannerTitle.style.transform = `translateY(${titleTranslation}px)`;

        const maxScroll = 250;
        const opacity = Math.max(1 - scrollPosition / maxScroll, 0);
        bannerTitle.style.opacity = opacity;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="header-banner">
      <div className="header-banner-overlay">
        <h1 className="header-banner-title">{title}</h1>
      </div>
      <img src={imageSrc} alt={title} className="header-banner-image" />
    </div>
  );
};

export default HeaderBanner;
