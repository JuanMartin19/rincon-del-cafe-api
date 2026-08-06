const pool = require('../db/pool');

// Obtener pedidos pendientes para el Admin
async function listarPedidos(req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM pedidos WHERE estado = 'pendiente' ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error('Error al listar pedidos:', err);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
}

// Crear un pedido (Llamado desde el Checkout)
async function crearPedido(req, res, io) {
  const { producto, preparacion, precio } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO pedidos (producto, preparacion, precio, estado) VALUES (?, ?, ?, ?)',
      [producto, preparacion || 'Estándar', precio, 'pendiente']
    );

    const nuevoPedido = {
      id: result.insertId,
      producto,
      preparacion: preparacion || 'Estándar',
      precio: Number(precio),
      hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    };

    // ⚡ Emitir en tiempo real a todos los administradores conectados vía WebSocket
    io.emit('actualizacion_tv', nuevoPedido);

    res.status(201).json({ success: true, pedido: nuevoPedido });
  } catch (err) {
    console.error('Error al crear pedido:', err);
    res.status(500).json({ error: 'Error al registrar pedido' });
  }
}

// Marcar pedido como completado
async function completarPedido(req, res) {
  const { id } = req.params;
  try {
    await pool.query("UPDATE pedidos SET estado = 'completado' WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error al completar pedido:', err);
    res.status(500).json({ error: 'Error al actualizar' });
  }
}

module.exports = { listarPedidos, crearPedido, completarPedido };