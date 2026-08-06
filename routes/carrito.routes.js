const router = require('express').Router();
const { obtenerCarrito, agregarAlCarrito, actualizarCantidad, vaciarCarrito } = require('../controllers/carrito.controller');
const { verificarToken } = require('../middleware/auth.middleware');

router.get('/', verificarToken, obtenerCarrito);
router.post('/add', verificarToken, agregarAlCarrito);
router.put('/update', verificarToken, actualizarCantidad);
router.delete('/clear', verificarToken, vaciarCarrito);

module.exports = router;