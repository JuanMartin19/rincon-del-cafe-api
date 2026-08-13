const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { verificarToken } = require('../middleware/auth.middleware');

const { listar, activas, crear, toggleActivo, eliminar } = require('../controllers/promociones.controller');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Rutas Públicas
router.get('/', listar);
router.get('/activas', activas);

// Rutas de Administración
router.post('/', verificarToken, upload.single('image'), crear);
router.put('/:id/estado', verificarToken, toggleActivo);
router.delete('/:id', verificarToken, eliminar);

module.exports = router;