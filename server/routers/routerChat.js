const { Server } = require('socket.io');
const db = require('../../database/db');  // Asegúrate de que este archivo esté configurado correctamente

module.exports = (server) => {
  const io = new Server(server);

  io.on('connection', async (socket) => {
    console.log('Un usuario se ha conectado');

    // Recuperar mensajes existentes al conectar
    try {
      const result = await db.query(`
        SELECT messages.id, messages.content, messages.created_at, users.username
        FROM messages
        JOIN users ON messages.user_id = users.id
        ORDER BY messages.created_at ASC
      `);

      if (result.rows.length === 0) {
        console.log('No hay mensajes previos.');
      } else {
        result.rows.forEach(row => {
          io.emit('chat message', {
            user: row.username,
            content: row.content,
            id: row.id.toString()
          });
        });
      }
    } catch (error) {
      console.error('Error al recuperar mensajes:', error.message);
    }

    socket.on('disconnect', () => {
      console.log('Un usuario se ha desconectado');
    });

    // Manejar mensajes de chat
    socket.on('chat message', async ({ user_id, content }) => {
      if (!user_id || !content || content.trim() === '') {
        console.warn('user_id o contenido no válidos:', { user_id, content });
        return;
      }

      try {
        // Guardar el mensaje en la base de datos
        const insertResult = await db.query(
          'INSERT INTO messages (user_id, content) VALUES ($1, $2) RETURNING id',
          [user_id, content]
        );

        // Obtener el nombre de usuario
        const userResult = await db.query(
          'SELECT username FROM users WHERE id = $1',
          [user_id]
        );

        const username = userResult.rows[0]?.username || 'Desconocido';

        // Emitir el mensaje a todos los clientes conectados
        io.emit('chat message', {
          user: username,
          content,
          id: insertResult.rows[0].id.toString()
        });
      } catch (error) {
        console.error('Error al guardar el mensaje:', error.message);
      }
    });
  });

  return io;
};
