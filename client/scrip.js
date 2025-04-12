import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';

const socket = io();

const form = document.getElementById('chatForm');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

let username = localStorage.getItem('username');
let userId = localStorage.getItem('userId');

// Si no hay username, lo solicitamos
if (!username) {
  username = prompt('Ingresa tu nombre de usuario:');
  if (!username || username.trim() === '') {
    alert('Nombre de usuario inválido.');
    throw new Error('Nombre inválido');
  }

  // Llamamos al backend para registrar/recuperar el usuario
  fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  })
    .then(res => {
      if (!res.ok) throw new Error('Error en la solicitud');
      return res.json();
    })
    .then(data => {
      userId = data.id;
      localStorage.setItem('username', username);
      localStorage.setItem('userId', userId);
    })
    .catch(err => {
      console.error('❌ Error al registrar usuario:', err.message);
      alert('No se pudo registrar el usuario');
    });
}

// Enviar mensajes
form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value && userId) {
    socket.emit('chat message', {
      user: username,
      user_id: userId,
      content: input.value,
    });
    input.value = '';
  }
});

// Recibir mensajes
socket.on('chat message', (msg) => {
  const item = document.createElement('div');
  item.textContent = `${msg.user}: ${msg.content}`;
  item.classList.add(msg.user === username ? 'own' : 'other');
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});
