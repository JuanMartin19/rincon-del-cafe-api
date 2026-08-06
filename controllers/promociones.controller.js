const pool = require('../db/pool');

async function listar(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM promociones ORDER BY activo DESC, id DESC');
    res.json(rows);
  } catch (err) { 
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' }); 
  }
}

async function activas(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM promociones WHERE activo = true');
    res.json(rows);
  } catch (err) { 
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' }); 
  }
}

async function crear(req, res) {
  // ⚡ Extraemos los datos de req.body (que ahora vienen gracias a que multer procesa el FormData)
  const { titulo, descripcion, tipo, categoria_aplica, valor, productos_ids } = req.body;
  
  const imagen = req.file ? `/uploads/${req.file.filename}` : null;
  const ids_str = productos_ids ? productos_ids.toString() : null;

  try {
    await pool.query(
      'INSERT INTO promociones (titulo, descripcion, tipo, categoria_aplica, valor, productos_ids, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [titulo, descripcion, tipo, categoria_aplica, valor || 0, ids_str, imagen]
    );
    res.status(201).json({ success: true });
  } catch (err) { 
    console.error('Error al crear promoción en BD:', err);
    res.status(500).json({ error: 'Error al crear promoción' }); 
  }
}

async function toggleActivo(req, res) {
  const { id } = req.params;
  const { activo } = req.body;
  try {
    await pool.query('UPDATE promociones SET activo = ? WHERE id = ?', [activo, id]);
    res.json({ success: true });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar' }); 
  }
}

async function eliminar(req, res) {
  try {
    await pool.query('DELETE FROM promociones WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar' }); 
  }
}

module.exports = { listar, activas, crear, toggleActivo, eliminar };