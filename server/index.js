require('dotenv').config();
const jwt = require('jsonwebtoken');

const express = require('express');
const logger = require('morgan');
const { createServer } = require('node:http');
const connectToDB = require('../database/db');
const authRouter = require('./routers/routerAuth'); 
const chatRouter = require('./routers/routerChat'); 

const port = process.env.PORT || 3000;

const app = express();
const server = createServer(app);

// Middleware
app.use(express.static('client')); // Servir archivos estáticos desde la carpeta 'client'
app.use(logger('dev')); // Registrar solicitudes en la consola
app.use(express.json()); // Parsear JSON en las solicitudes

(async () => {
  const db = await connectToDB(); // Conectar a la base de datos

  // Usar routers
  app.use('/api', authRouter(db)); // Usar el router de autenticación
  chatRouter(server, db); // Usar el router de chat

  // Ruta principal
  app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/client/index.html'); 
  });

  // Iniciar servidor
  server.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  });
})();
