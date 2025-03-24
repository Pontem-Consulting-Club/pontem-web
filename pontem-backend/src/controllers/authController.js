const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const login = async (req, res) => {
  const { username, password } = req.body;
  console.log('Intentando iniciar sesión con el usuario:', username);

  try {
    const result = await db.query('SELECT * FROM "Users" WHERE username = $1', [username]);
    console.log('Resultado de la consulta:', result.rows);

    const user = result.rows[0];
    if (!user) {
      console.log('Usuario no encontrado');
      return res.status(401).json({ error: 'Usuario o contraseña inválidos' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Resultado de la comparación de contraseñas:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Contraseña incorrecta');
      return res.status(401).json({ error: 'Usuario o contraseña inválidos' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    console.log('Token generado:', token);

    res.json({ token });
  } catch (error) {
    console.error('Error en el login:', error.message, error.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getUserInfo = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const result = await db.query('SELECT * FROM "Users" WHERE id = $1', [userId]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { login, getUserInfo };