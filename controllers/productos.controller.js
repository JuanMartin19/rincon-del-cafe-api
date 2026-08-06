const pool = require('../db/pool');

// GET /api/productos?category=Caliente
async function listar(req, res) {
  const { category } = req.query;
  try {
    let query = `
      SELECT id, nombre AS name, categoria AS category, 
             precio AS price, tipo AS type, imagen AS image 
      FROM productos
    `;
    const params = [];

    if (category && category !== 'Todos') {
      query += ' WHERE categoria = ?';
      params.push(category);
    }
    query += ' ORDER BY id';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

// GET /api/productos/destacados
async function destacados(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT id, nombre AS name, categoria AS category, precio AS price, tipo AS type, imagen AS image 
      FROM productos 
      WHERE destacado = true 
      ORDER BY id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

// GET /api/productos/:id
async function obtenerPorId(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT id, nombre AS name, categoria AS category, 
             precio AS price, tipo AS type, imagen AS image 
      FROM productos 
      WHERE id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

// GET /api/productos
async function obtenerProductos(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM productos');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
}

// POST /api/productos
async function crearProducto(req, res) {
  const { name, category, price, description } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image || '');

  // Calculamos el "tipo" automáticamente para cumplir con la base de datos
  const tipo = category === 'Postres' ? 'Alimento' : 'Bebida';

  try {
    const [result] = await pool.query(
      'INSERT INTO productos (nombre, categoria, precio, tipo, descripcion, imagen) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category, price, tipo, description || '', image]
    );
    res.status(201).json({ id: result.insertId, name, category, price, image });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
}

// PUT /api/productos/:id
async function actualizarProducto(req, res) {
  const { id } = req.params;
  const { name, category, price, description } = req.body;
  
  // Calculamos el "tipo" automáticamente
  const tipo = category === 'Postres' ? 'Alimento' : 'Bebida';
  
  try {
    let imageQuery = '';
    let params = [name, category, price, tipo, description || ''];

    if (req.file) {
      imageQuery = ', imagen = ?';
      params.push(`/uploads/${req.file.filename}`);
    } else if (req.body.image) {
      imageQuery = ', imagen = ?';
      params.push(req.body.image);
    }

    params.push(id);

    await pool.query(
      `UPDATE productos SET nombre = ?, categoria = ?, precio = ?, tipo = ?, descripcion = ? ${imageQuery} WHERE id = ?`,
      params
    );
    res.json({ ok: true, message: 'Producto actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
}

// DELETE /api/productos/:id
async function eliminarProducto(req, res) {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM productos WHERE id = ?', [id]);
    res.json({ ok: true, message: 'Producto eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
}

module.exports = { listar, destacados, obtenerPorId, obtenerProductos, crearProducto, actualizarProducto, eliminarProducto };