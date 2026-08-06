const express = require('express');

module.exports = function(io) {
  const router = express.Router();
  const { listarPedidos, crearPedido, completarPedido } = require('../controllers/pedidos.controller');

  router.get('/', listarPedidos);
  router.post('/', (req, res) => crearPedido(req, res, io));
  router.put('/:id/completar', completarPedido);

  return router;
};