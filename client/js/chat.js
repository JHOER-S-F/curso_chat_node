// Exportar función para recibir mensajes
export function receiveMessages(socket, messages, username) {
  socket.on('chat message', (msg) => {
    const item = document.createElement('div');
    item.textContent = `${msg.user}: ${msg.content}`;
    item.classList.add(msg.user === username ? 'own' : 'other');
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight; // Desplazar hacia abajo para mostrar el último mensaje
  });
}
