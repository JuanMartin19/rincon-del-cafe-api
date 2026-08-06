const pool = require('../db/pool');

// Obtener los favoritos del usuario logueado
async function obtenerFavoritos(req, res) {
  try {
    // req.usuario viene del middleware verificarToken
    const usuario_id = req.usuario.id; 
    
    const query = `
      SELECT p.id, p.nombre AS name, p.categoria AS category, 
             p.precio AS price, p.tipo AS type, p.imagen AS image 
      FROM productos p
      INNER JOIN favoritos f ON p.id = f.producto_id
      WHERE f.usuario_id = ?
    `;
    const [rows] = await pool.query(query, [usuario_id]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

// Agregar o quitar un favorito (Toggle)
async function toggleFavorito(req, res) {
  try {
    const usuario_id = req.usuario.id;
    const { producto_id } = req.body;

    // Revisar si ya es favorito
    const [existe] = await pool.query('SELECT * FROM favoritos WHERE usuario_id = ? AND producto_id = ?', [usuario_id, producto_id]);
    
    if (existe.length > 0) {
      await pool.query('DELETE FROM favoritos WHERE usuario_id = ? AND producto_id = ?', [usuario_id, producto_id]);
      return res.json({ action: 'removed' });
    } else {
      await pool.query('INSERT INTO favoritos (usuario_id, producto_id) VALUES (?, ?)', [usuario_id, producto_id]);
      return res.json({ action: 'added' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

module.exports = { obtenerFavoritos, toggleFavorito };