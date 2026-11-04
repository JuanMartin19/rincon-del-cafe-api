const express = require('express');
const router = express.Router();
const pool = require('../db/pool'); // Asegúrate de que la ruta a tu BD sea correcta

module.exports = (io) => {
  // 1. Obtener el historial de un pedido
  router.get('/:pedidoId', async (req, res) => {
    try {
      const [mensajes] = await pool.query(
        'SELECT * FROM mensajes_pedido WHERE pedido_id = ? ORDER BY fecha_envio ASC',
        [req.params.pedidoId]
      );
      res.json(mensajes);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener mensajes' });
    }
  });

  // 2. Guardar un nuevo mensaje y emitirlo
  router.post('/:pedidoId', async (req, res) => {
    const { emisor_id, emisor_nombre, rol_emisor, mensaje } = req.body;
    const pedido_id = req.params.pedidoId;

    if (!mensaje || mensaje.trim() === '') {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
    }

    try {
      const [result] = await pool.query(
        'INSERT INTO mensajes_pedido (pedido_id, emisor_id, emisor_nombre, rol_emisor, mensaje) VALUES (?, ?, ?, ?, ?)',
        [pedido_id, emisor_id, emisor_nombre, rol_emisor, mensaje]
      );

      const nuevoMensaje = {
        id: result.insertId,
        pedido_id,
        emisor_id,
        emisor_nombre,
        rol_emisor,
        mensaje,
        fecha_envio: new Date()
      };

      // Emitir mensaje solo a los conectados a este pedido específico
      io.to(`pedido_${pedido_id}`).emit('nuevo_mensaje', nuevoMensaje);
      res.status(201).json(nuevoMensaje);
    } catch (error) {
      res.status(500).json({ error: 'Error al enviar el mensaje' });
    }
  });

  // 3. Limpiar historial
  router.delete('/:pedidoId', async (req, res) => {
    try {
      await pool.query('DELETE FROM mensajes_pedido WHERE pedido_id = ?', [req.params.pedidoId]);
      io.to(`pedido_${req.params.pedidoId}`).emit('historial_limpiado');
      res.json({ message: 'Historial eliminado' });
    } catch (error) {
      res.status(500).json({ error: 'Error al limpiar el historial' });
    }
  });

  return router;
};