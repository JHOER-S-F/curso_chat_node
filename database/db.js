require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

async function connectToDB() {
  try {
    if (!process.env.PG_HOST || !process.env.PG_USER || !process.env.PG_PASSWORD || !process.env.PG_DATABASE) {
      throw new Error('Faltan variables de entorno para PostgreSQL');
    }

    const pool = new Pool({
      host: process.env.PG_HOST,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      port: process.env.PG_PORT || 5432,
    });

    console.log('Conexión a PostgreSQL establecida correctamente');

    // Crear tabla de usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    `);
    

    // Crear tabla de mensajes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    `);
    

    return pool;
  } catch (error) {
    console.error('Error al conectar con PostgreSQL o crear tablas:', error.message);
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
