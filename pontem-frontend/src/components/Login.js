import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../styles/Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica si ya hay un token almacenado
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/admin'); // Redirige al usuario si ya está autenticado
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de campos vacíos
    if (!username || !password) {
      setError('Por favor, complete todos los campos.');
      return;
    }

    try {
      const response = await api.post('/auth/login', { username, password });
      console.log('Login exitoso:', response.data);
      localStorage.setItem('token', response.data.token);
      navigate('/admin');
    } catch (error) {
      if (error.response) {
        console.error('Error en el login:', error.response.data.error);
        setError(`Error: ${error.response.data.error}`);
      } else {
        console.error('Error en el login:', error.message);
        setError('Error: No se pudo conectar con el servidor');
      }
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-card">
        {error && <div className="error-message">{error}</div>}
        <h2 className='form-title'>Iniciar Sesión</h2>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <div className="password-container">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="toggle-password"
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
        </div>
        <button className="login-button" type="submit">Entrar</button>
      </div>
    </form>
  );
}

export default Login;