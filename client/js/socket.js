import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';
import { receiveMessages } from './chat.js';

export function setupSocket(userId, username, messages) {
  const socket = io();

  // Recibir mensajes
  receiveMessages(socket, messages, username);

  return socket;
}
