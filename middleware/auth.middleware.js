const jwt = require('jsonwebtoken');

// Protege rutas: exige un header "Authorization: Bearer <token>" válido.
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  // ⚡ Validación estricta del secreto
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("ERROR CRÍTICO: La variable de entorno JWT_SECRET no está configurada.");
    return res.status(500).json({ error: 'Error interno de configuración del servidor' });
  }

  jwt.verify(token, secret, (err, payload) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    req.usuario = payload; // { id, email }
    next();
  });
}

module.exports = { verificarToken };