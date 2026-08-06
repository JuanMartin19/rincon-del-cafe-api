const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

const { listar, activas, crear, toggleActivo, eliminar } = require('../controllers/promociones.controller');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.get('/', listar);
router.get('/activas', activas);
router.post('/', upload.single('image'), crear); // ⚡ Soporta imagen con Multer
router.put('/:id/estado', toggleActivo);
router.delete('/:id', eliminar);

module.exports = router;