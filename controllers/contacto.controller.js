const pool = require('../db/pool');

// POST /api/contacto/newsletter
async function suscribirNewsletter(req, res) {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Por favor, ingresa un correo electrónico válido.' });
  }

  try {
    // 1. Verificar si el correo ya está registrado
    const [existe] = await pool.query('SELECT id FROM suscripciones WHERE email = ?', [email]);

    if (existe.length > 0) {
      return res.status(400).json({ message: 'Este correo ya está suscrito a nuestro boletín.' });
    }

    // 2. Guardar el nuevo correo
    await pool.query('INSERT INTO suscripciones (email) VALUES (?)', [email]);
    res.status(201).json({ message: '¡Suscripción exitosa!' });

  } catch (err) {
    console.error('Error en newsletter:', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
}

// Si ya tenías otras funciones aquí, asegúrate de no borrarlas y solo agregar esta a la exportación
module.exports = { suscribirNewsletter };