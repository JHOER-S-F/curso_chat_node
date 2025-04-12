require('dotenv').config({ path: '../.env' });
const { createClient } = require('@libsql/client');

async function connectToDB() {
  try {
    if (!process.env.TURSO_DB_URL || !process.env.TURSO_DB_TOKEN) {
      throw new Error('Faltan variables de entorno');
    }

    const db = createClient({
      url: process.env.TURSO_DB_URL,
      authToken: process.env.TURSO_DB_TOKEN,
    });

    console.log('Conexión a Turso establecida correctamente');

    // Crear tabla de usuarios
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tabla "users" verificada o creada correctamente');

    // Crear tabla de mensajes
    await db.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    console.log('Tabla "messages" verificada o creada correctamente');
    return db;
  } catch (error) {
    console.error('Error al conectar con la base de datos o crear tabla:', error.message);
    throw error; 
  }
}

module.exports = connectToDB;

// Ejecutar el script directamente si se llama a este archivo
if (require.main === module) {
  (async () => {
    await connectToDB();
  })();
}
