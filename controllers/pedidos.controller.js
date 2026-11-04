const pool = require('../db/pool');

// Obtener pedidos pendientes para el Admin
async function listarPedidos(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM pedidos WHERE LOWER(estado) IN ('pendiente', 'en espera') ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error('Error al listar pedidos:', err);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
}

// NUEVA FUNCIÓN: Obtener el historial de pedidos exclusivo del usuario logueado
async function obtenerMisPedidos(req, res) {
  try {
    const usuario_id = req.usuario.id; // Extraído del token
    const [rows] = await pool.query("SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY id DESC", [usuario_id]);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener mis pedidos:', err);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
}

// Crear un pedido (Llamado desde el Checkout)
async function crearPedido(req, res, io) {
  const { producto, preparacion, precio } = req.body;
  const usuario_id = req.usuario.id; // Ya lo sacamos del token de manera segura

  try {
    const [result] = await pool.query(
      'INSERT INTO pedidos (usuario_id, producto, preparacion, precio, estado) VALUES (?, ?, ?, ?, ?)',
      [usuario_id, producto, preparacion || 'Estándar', precio, 'pendiente']
    );

    const nuevoPedido = {
      id: result.insertId,
      usuario_id,
      producto,
      preparacion: preparacion || 'Estándar',
      precio: Number(precio),
      estado: 'pendiente',
      hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    };

    // Emitir en tiempo real a los administradores
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

module.exports = { listarPedidos, obtenerMisPedidos, crearPedido, completarPedido };