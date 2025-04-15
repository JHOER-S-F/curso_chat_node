const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

module.exports = (db) => {
  // Ruta para registrar nuevos usuarios
  router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    try {
      console.log('Verificando si el usuario existe:', username);
      const existing = await db.query('SELECT id FROM users WHERE username = $1', [username]);

      if (existing.rows.length > 0) {
        console.warn('El usuario ya existe:', username);
        return res.status(409).json({ error: 'El usuario ya existe' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.query(
        'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
        [username, hashedPassword]
      );

      return res.status(201).json({ id: result.rows[0].id });
    } catch (error) {
      console.error('Error al registrar usuario:', error.message);
      res.status(500).json({ error: 'Error del servidor' });
    }
  });

  // Ruta para iniciar sesión
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Nombre de usuario y contraseña requeridos' });
    }

    try {
      console.log('Intentando iniciar sesión con:', username);
      const result = await db.query(
        'SELECT id, username, password FROM users WHERE username = $1',
        [username]
      );

      if (result.rows.length === 0) {
        console.warn('Usuario no encontrado:', username);
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        console.warn('Contraseña incorrecta para el usuario:', username);
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
        expiresIn: '1h'
      });

      return res.json({ token });
    } catch (error) {
      console.error('❌ Error en login:', error.message);
      res.status(500).json({ error: 'Error del servidor' });
    }
  });

  return router;
};
