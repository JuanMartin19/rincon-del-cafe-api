const jwt = require('jsonwebtoken');

// Protege rutas: exige un header "Authorization: Bearer <token>" válido.
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  // Usamos la misma clave secreta de respaldo que en el controlador
  const secret = process.env.JWT_SECRET || 'secreto_super_seguro_123';

  jwt.verify(token, secret, (err, payload) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    req.usuario = payload; // { id, email }
    next();
  });
}

module.exports = { verificarToken };