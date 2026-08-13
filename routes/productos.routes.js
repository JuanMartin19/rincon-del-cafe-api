const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { verificarToken } = require('../middleware/auth.middleware');

const { 
  listar, 
  destacados, 
  obtenerPorId, 
  obtenerProductos, 
  crearProducto, 
  actualizarProducto, 
  eliminarProducto 
} = require('../controllers/productos.controller');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.get('/destacados', destacados);
router.get('/todos', obtenerProductos);
router.get('/', listar);
router.get('/:id', obtenerPorId);
router.post('/', verificarToken, upload.single('image'), crearProducto);
router.put('/:id', verificarToken, upload.single('image'), actualizarProducto);
router.delete('/:id', verificarToken, eliminarProducto);

module.exports = router;