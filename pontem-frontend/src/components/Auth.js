import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import AuthToggle from './AuthToggle';
import { Container } from 'react-bootstrap';
import '../styles/Auth.css';

const Auth = () => {
  const location = useLocation();
  const defaultToLogin = location.state?.defaultToLogin ?? true;
  const [isLogin, setIsLogin] = useState(defaultToLogin);

  useEffect(() => {
    setIsLogin(defaultToLogin);
  }, [defaultToLogin]);

  const toggleForm = (login) => {
    setIsLogin(login);
  };

  return (
    <Container className="auth-container">
      <AuthToggle isLogin={isLogin} toggleForm={toggleForm} />
      <div className="auth-card">
        {isLogin ? <Login toggleForm={() => toggleForm(false)} /> : <Register toggleForm={() => toggleForm(true)} />}
      </div>
    </Container>
  );
};

export default Auth;