import { setupSocket } from './socket.js';
import { authenticate } from './auth.js';

const form = document.getElementById('chatForm');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

// Variables para el estado del usuario
let username, userId;

// Esperar autenticación
(async () => {
  const authenticated = await authenticate();  // Usar authenticate en lugar de login
  if (!authenticated) return;

  // Obtener datos del usuario después de la autenticación
  username = localStorage.getItem('username');
  userId = localStorage.getItem('userId');
  
  // Guardar token en localStorage
  const data = { token: 'yourToken' }; // Deberías recibir el token de tu backend al autenticar
  localStorage.setItem('token', data.token); // Guardar token

  // Configurar Socket.io
  const socket = setupSocket(userId, username, messages);

  // Enviar mensajes
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value && userId) {
      socket.emit('chat message', {
        user_id: userId,
        content: input.value,
      });
      input.value = ''; // Limpiar el input después de enviar
    }
  });
})();
