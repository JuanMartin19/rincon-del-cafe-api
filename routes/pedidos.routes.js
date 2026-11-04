const express = require('express');

module.exports = function(io) {
  const router = express.Router();
  const { listarPedidos, obtenerMisPedidos, crearPedido, completarPedido } = require('../controllers/pedidos.controller');
  const { verificarToken } = require('../middleware/auth.middleware');

  // ⚡ Agregamos verificarToken aquí también
  router.get('/', verificarToken, listarPedidos);
  router.get('/mis-pedidos', verificarToken, obtenerMisPedidos);
  router.post('/', verificarToken, (req, res) => crearPedido(req, res, io));
  router.put('/:id/completar', verificarToken, completarPedido);

  return router;
};