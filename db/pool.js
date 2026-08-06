const mysql = require('mysql2/promise');
require('dotenv').config();

// Crear el pool de conexiones de MySQL
const conexion = mysql.createPool({ // o createConnection, dependiendo de cómo lo tengas
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  // ¡AGREGA ESTO! 👇
  ssl: {
    rejectUnauthorized: false
  }
});

// Comprobar la conexión inicial
pool.getConnection()
  .then(connection => {
    console.log('Conectado exitosamente a la base de datos MySQL');
    connection.release();
  })
  .catch(error => {
    console.error('Error al conectar con MySQL:', error.message);
  });

module.exports = pool;