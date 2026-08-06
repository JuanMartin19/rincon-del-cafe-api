const express = require('express');
const router = express.Router();
const { suscribirNewsletter } = require('../controllers/contacto.controller');

// Ruta para el modal de newsletter
router.post('/newsletter', suscribirNewsletter);

module.exports = router;