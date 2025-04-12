require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const { Server } = require('socket.io');
const { createServer } = require('node:http');
const connectToDB = require('../database/db');

const port = process.env.PORT || 3000;

const app = express();
const server = createServer(app);
const io = new Server(server);

// Middleware
app.use(express.static('client'));
app.use(logger('dev'));
app.use(express.json());

(async () => {
  const db = await connectToDB();

  // Ruta para registro o recuperación de usuarios
  app.post('/api/login', async (req, res) => {
    const { username, password, email } = req.body;

    // Validación básica de datos
    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    try {
      // Buscar si el usuario ya existe
      const result = await db.execute({
        sql: 'SELECT id FROM users WHERE username = :username',
        args: { username }
      });

      // Si el usuario existe, devolver su ID
      if (result.rows.length > 0) {
        return res.json({ id: result.rows[0].id });
      }

      // Si no existe, insertar el nuevo usuario
      const insertResult = await db.execute({
        sql: 'INSERT INTO users (username, password, email) VALUES (:username, :password, :email)',
        args: { username, password, email }
      });

      // Devolver el ID del nuevo usuario
      return res.json({ id: insertResult.lastInsertRowid });
    } catch (error) {
      console.error('❌ Error al crear usuario:', error.message);
      res.status(500).json({ error: 'Error al crear usuario' });
    }
  });

  // Socket.io para mensajes
  io.on('connection', async (socket) => {
    console.log('✅ Un usuario se ha conectado');

    try {
      // Recuperar mensajes y usuarios
      const result = await db.execute(`
        SELECT messages.id, messages.content, messages.created_at, users.username
        FROM messages
        JOIN users ON messages.user_id = users.id
        ORDER BY messages.created_at ASC
      `);

      // Emitir mensajes al nuevo usuario
      result.rows.forEach(row => {
        io.emit('chat message', {
          user: row.username,
          content: row.content,
          id: row.id.toString(), // Convertir a string
        });
      });
    } catch (error) {
      console.error('❌ Error al recuperar mensajes:', error.message);
    }

    // Manejo de desconexión
    socket.on('disconnect', () => {
      console.log('❌ Un usuario se ha desconectado');
    });

    // Manejo de mensajes entrantes
    socket.on('chat message', async ({ user_id, content }) => {
      if (!content || content.trim() === '') return;

      try {
        // Guardar mensaje en la base de datos
        const result = await db.execute({
          sql: `INSERT INTO messages (user_id, content) VALUES (:user_id, :content)`,
          args: { user_id, content }
        });

        // Obtener el nombre del usuario para emitir el mensaje
        const userResult = await db.execute({
          sql: `SELECT username FROM users WHERE id = :id`,
          args: { id: user_id }
        });

        const username = userResult.rows[0]?.username || 'Desconocido';

        // Emitir mensaje a todos los usuarios conectados
        io.emit('chat message', {
          user: username,
          content,
          id: result.lastInsertRowid.toString() // Convertir a string
        });
      } catch (error) {
        console.error('❌ Error al guardar el mensaje:', error.message);
      }
    });
  });

  // Ruta principal
  app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/client/index.html');
  });

  // Iniciar servidor
  server.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  });
})();
