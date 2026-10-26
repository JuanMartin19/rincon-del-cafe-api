const express = require('express');

module.exports = function(io) {
  const router = express.Router();
  const { listarPedidos, obtenerMisPedidos, crearPedido, completarPedido } = require('../controllers/pedidos.controller');
  const { verificarToken } = require('../middleware/auth.middleware');

  router.get('/', listarPedidos);
  router.get('/mis-pedidos', verificarToken, obtenerMisPedidos);
  router.post('/', verificarToken, (req, res) => crearPedido(req, res, io));
  router.put('/:id/completar', completarPedido);

  return router;
};