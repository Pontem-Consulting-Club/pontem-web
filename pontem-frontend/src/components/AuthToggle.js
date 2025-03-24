import React from 'react';
import '../styles/AuthToggle.css';

function AuthToggle({ isLogin, toggleForm }) {
  return (
    <div className="flex justify-center mb-4">
      <div className="relative inline-flex items-center bg-gray-200 rounded-full">
        <div className={`toggle-background ${isLogin ? 'move-left' : 'move-right'}`}></div>
        <span
          onClick={() => toggleForm(true)}
          className={`cursor-pointer px-4 py-2 rounded-full ${
            isLogin ? 'text-green-500' : 'text-gray-500'
          }`}
        >
          Iniciar Sesión
        </span>
        <span
          onClick={() => toggleForm(false)}
          className={`cursor-pointer px-4 py-2 rounded-full ${
            !isLogin ? 'text-green-500' : 'text-gray-500'
          }`}
        >
          Crear Cuenta
        </span>
      </div>
    </div>
  );
}

export default AuthToggle;