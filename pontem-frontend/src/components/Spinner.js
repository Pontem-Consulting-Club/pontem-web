import React from 'react';
import '../styles/Spinner.css';

const Spinner = () => {
  return (
    <div className="spinner">
      <div className="ring">
        <div className="inner-circle"></div>
      </div>
    </div>
  );
};

export default Spinner; 