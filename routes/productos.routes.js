const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

const { 
  listar, 
  destacados, 
  obtenerPorId, 
  obtenerProductos, 
  crearProducto, 
  actualizarProducto, 
  eliminarProducto 
} = require('../controllers/productos.controller');

// Configuración de almacenamiento local con Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Guarda los archivos en la carpeta 'uploads' de la raíz del backend
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Rutas limpias y ordenadas (específicas primero, dinámicas después)
router.get('/destacados', destacados);
router.get('/todos', obtenerProductos);
router.get('/', listar);
router.get('/:id', obtenerPorId);

// Rutas de administración con soporte para middleware de Multer (campo 'image')
router.post('/', upload.single('image'), crearProducto);
router.put('/:id', upload.single('image'), actualizarProducto);
router.delete('/:id', eliminarProducto);

module.exports = router;