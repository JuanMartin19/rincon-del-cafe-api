const mysql = require('mysql2/promise');
require('dotenv').config();

// Crear el pool de conexiones de MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
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