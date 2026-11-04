const router = require('express').Router();
const { register, login, loginPin, setPin, checkPinStatus, obtenerUsuarios, crearUsuarioAdmin, cambiarRol, eliminarUsuario } = require('../controllers/auth.controller')
const { verificarToken } = require('../middleware/auth.middleware');

router.get('/verificar-sesion', verificarToken, (req, res) => {
  res.json({ ok: true, usuario: req.usuario });
});
router.post('/register', register);      // Web: crear cuenta
router.post('/login', login);            // Web: entrar con email + contraseña
router.post('/login-pin', loginPin);     // Wearable: entrar con email + PIN
router.put('/pin', verificarToken, setPin); // Web (logueado): configurar el PIN del reloj
router.get('/usuarios', verificarToken, obtenerUsuarios);
router.post('/crear-usuario', verificarToken, crearUsuarioAdmin);
router.get('/check-pin', verificarToken, checkPinStatus);
router.put('/usuarios/:id/rol', verificarToken, cambiarRol);
router.delete('/usuarios/:id', verificarToken, eliminarUsuario);

module.exports = router;