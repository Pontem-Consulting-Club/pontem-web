import React from 'react';
import '../styles/SocialMediaLinks.css';

const SocialMediaLinks = () => {
  const handleInstagramClick = () => {
    window.open("https://www.instagram.com/pontemconsultingclub/", "_blank");
  };

  const handleLinkedInClick = () => {
    window.open("https://www.linkedin.com/company/pontemcc/mycompany/", "_blank");
  };

  return (
    <div className="flex flex-column align-items-center">
      <h5 className="social-media-links-title">Conéctate con nosotros y no te pierdas nuestros eventos</h5>
      <div className="social-media-links">
        <img 
          src="instagram-logo.png" 
          alt="Instagram Logo" 
          onClick={handleInstagramClick} 
          className="social-logo"
        />
        <img 
          src="linkedin-logo.png" 
          alt="LinkedIn Logo" 
          onClick={handleLinkedInClick} 
          className="social-logo"
        />
      </div>
    </div>
  );
};

export default SocialMediaLinks; 