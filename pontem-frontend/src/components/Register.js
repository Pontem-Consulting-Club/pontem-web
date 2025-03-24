import React, { useState, useContext } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { AuthContext } from '../context/authContext';
import '../styles/Auth.css';

function Register({ toggleForm }) {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validación de campos vacíos
    if (!name || !lastName || !email || !password) {
      setError('Por favor, complete todos los campos.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('lastName', lastName);
    formData.append('email', email);
    formData.append('password', password);
    if (profilePicture) {
      formData.append('profilePicture', profilePicture);
    }

    try {
      await api.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, response.data.user);
      setSuccess('Cuenta creada exitosamente');
      navigate('/');
    } catch (error) {
      if (error.response) {
        setError(error.response.data.error);
      } else {
        setError('Error creando la cuenta');
      }
    }
  };

  return (
    <Card className="auth-card">
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleRegister}>
          <Form.Group controlId="formBasicName" className="form-group">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingresa tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formBasicLastName" className="form-group">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingresa tu apellido"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formBasicEmail" className="form-group">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Ingresa tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formBasicPassword" className="form-group">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formBasicProfilePicture" className="form-group">
            <Form.Label>Foto de Perfil <span className="text-secondary">(opcional)</span></Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePicture(e.target.files[0])}
            />
          </Form.Group>
          <div className="d-flex justify-content-center">
            <Button className="btn-custom my-3" type="submit">
              Crear Cuenta
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default Register;