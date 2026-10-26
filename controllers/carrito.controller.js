const pool = require('../db/pool');

// Obtener los elementos del carrito del usuario
async function obtenerCarrito(req, res) {
  try {
    const usuario_id = req.usuario.id;
    const [rows] = await pool.query(`
      SELECT c.id as cart_id, p.id, p.nombre AS name, p.categoria AS category, 
             p.precio AS price, p.tipo AS type, p.imagen AS image, c.cantidad AS qty, c.tamanio
      FROM carrito c
      INNER JOIN productos p ON c.producto_id = p.id
      WHERE c.usuario_id = ?
    `, [usuario_id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

// Agregar o actualizar cantidad en el carrito
async function agregarAlCarrito(req, res) {
  try {
    const usuario_id = req.usuario.id;
    // Extraemos el tamanio del body (por defecto Mediano)
    const { producto_id, cantidad = 1, tamanio = 'Mediano' } = req.body;

    const [existing] = await pool.query(
      'SELECT * FROM carrito WHERE usuario_id = ? AND producto_id = ?', 
      [usuario_id, producto_id]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE carrito SET cantidad = cantidad + ?, tamanio = ? WHERE usuario_id = ? AND producto_id = ?',
        [cantidad, tamanio, usuario_id, producto_id]
      );
    } else {
      await pool.query(
        'INSERT INTO carrito (usuario_id, producto_id, cantidad, tamanio) VALUES (?, ?, ?, ?)',
        [usuario_id, producto_id, cantidad, tamanio]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

// Modificar cantidad o eliminar item
async function actualizarCantidad(req, res) {
  try {
    const usuario_id = req.usuario.id;
    const { producto_id, cantidad } = req.body;

    if (cantidad <= 0) {
      await pool.query('DELETE FROM carrito WHERE usuario_id = ? AND producto_id = ?', [usuario_id, producto_id]);
    } else {
      await pool.query('UPDATE carrito SET cantidad = ? WHERE usuario_id = ? AND producto_id = ?', [cantidad, usuario_id, producto_id]);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

// Vaciar carrito
async function vaciarCarrito(req, res) {
  try {
    await pool.query('DELETE FROM carrito WHERE usuario_id = ?', [req.usuario.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

module.exports = { obtenerCarrito, agregarAlCarrito, actualizarCantidad, vaciarCarrito };