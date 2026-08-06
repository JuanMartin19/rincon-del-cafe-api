const router = require('express').Router();
const { obtenerFavoritos, toggleFavorito } = require('../controllers/favoritos.controller');
const { verificarToken } = require('../middleware/auth.middleware'); // Protegemos las rutas

router.get('/', verificarToken, obtenerFavoritos);
router.post('/toggle', verificarToken, toggleFavorito);

module.exports = router;