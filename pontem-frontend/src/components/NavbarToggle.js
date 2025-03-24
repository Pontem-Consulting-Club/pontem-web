import React from 'react';

const NavbarToggle = ({ toggleNavbar, isOpen }) => {
  return (
    <button
      className="navbar-toggler"
      type="button"
      aria-label="Toggle navigation"
      aria-expanded={isOpen}
      onClick={toggleNavbar}
    >
      <span className={`navbar-toggler-icon ${isOpen ? 'open' : '' }`}></span>
    </button>
  );
};

export default NavbarToggle;