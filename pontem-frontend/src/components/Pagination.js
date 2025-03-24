import React from 'react';
import { Button } from 'react-bootstrap';
import '../styles/Pagination.css'; // Asegúrate de crear este archivo para los estilos

function Pagination({ newsPerPage, totalNews, paginate, currentPage }) {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalNews / newsPerPage); i++) {
    pageNumbers.push(i);
  }

  const handlePageChange = (pageNumber) => {
    paginate(pageNumber);
    window.scrollTo({
      top: 250,
      behavior: 'smooth',
    });
  };

  return (
    <nav className="pagination-container">
      <ul className="pagination">
        {pageNumbers.map((number) => (
          <li
            key={number}
            className={`page-item ${currentPage === number ? 'active' : ''}`}
          >
            <Button
              onClick={() => handlePageChange(number)}
              className="page-link"
            >
              {number}
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Pagination;
