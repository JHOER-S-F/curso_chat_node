import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';

const socket = io();

const form = document.getElementById('chatForm');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

// Variables para el estado del usuario
let username = localStorage.getItem('username');
let userId = localStorage.getItem('userId');
let isLoggedIn = false;

// Función para iniciar sesión
async function login(usernameInput, passwordInput) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: usernameInput, password: passwordInput }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al iniciar sesión');
  }

  return await res.json(); // { id }
}

// Función para registrarse
async function register(usernameInput, passwordInput) {
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: usernameInput,
      password: passwordInput,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Error al registrar');
  }

  return await res.json(); // { id }
}

// Función para autenticar (login o registro)
async function authenticate() {
  const usernameInput = prompt('Ingresa tu nombre de usuario:');
  const passwordInput = prompt('Ingresa tu contraseña:');

  if (!usernameInput || !passwordInput) {
    alert('Nombre de usuario y contraseña son requeridos');
    return false;
  }

  try {
    // Intentamos iniciar sesión
    const data = await login(usernameInput, passwordInput);
    userId = data.id;
    username = usernameInput;
    isLoggedIn = true;
    localStorage.setItem('username', username);
    localStorage.setItem('userId', userId);
    return true;
  } catch (err) {
    console.warn('⚠️ Login falló:', err.message);
    const confirmRegister = confirm('Usuario no encontrado o contraseña incorrecta. ¿Deseas registrarte?');
    if (!confirmRegister) return false;

    try {
      const regData = await register(usernameInput, passwordInput);
      userId = regData.id;
      username = usernameInput;
      isLoggedIn = true;
      localStorage.setItem('username', username);
      localStorage.setItem('userId', userId);
      return true;
    } catch (regErr) {
      alert('❌ Error al registrarse: ' + regErr.message);
      return false;
    }
  }
}

// Esperar autenticación
(async () => {
  const authenticated = await authenticate();
  if (!authenticated) return;

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

  // Recibir mensajes
  socket.on('chat message', (msg) => {
    const item = document.createElement('div');
    item.textContent = `${msg.user}: ${msg.content}`;
    item.classList.add(msg.user === username ? 'own' : 'other');
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight; // Desplazar hacia abajo para mostrar el último mensaje
  });
})();
