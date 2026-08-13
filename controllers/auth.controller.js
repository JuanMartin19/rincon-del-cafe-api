const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

// Función auxiliar para obtener el secreto o lanzar error
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("ERROR CRÍTICO: La variable de entorno JWT_SECRET no está configurada.");
  }
  return secret;
};

// POST /api/auth/register
async function register(req, res) {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Faltan datos (nombre, email, password)' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const [existente] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existente.length > 0) {
      return res.status(409).json({ error: 'Ese email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
      [nombre, email, passwordHash]
    );

    res.status(201).json({
      id: result.insertId,
      nombre,
      email
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan datos (email, password)' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = rows[0];
    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol }, 
      getJwtSecret(), // ⚡ Llamada estricta
      { expiresIn: '7d' }
    );

    res.json({
      token,
      usuario: { 
        id: usuario.id, 
        nombre: usuario.nombre, 
        email: usuario.email, 
        rol: usuario.rol || 'cliente' 
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

// POST /api/auth/login-pin
async function loginPin(req, res) {
  const { email, pin } = req.body;

  if (!email || !pin) {
    return res.status(400).json({ error: 'Datos incorrectos' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Datos incorrectos' });
    }

    const usuario = rows[0];
    if (!usuario.pin_hash) {
      return res.status(401).json({ error: 'Este usuario aún no configuró un PIN' });
    }

    const valido = await bcrypt.compare(pin, usuario.pin_hash);
    if (!valido) {
      return res.status(401).json({ error: 'Datos incorrectos' });
    }

    // ⚡ DESTRUCCIÓN DEL PIN: Una vez validado correctamente, lo borramos de la DB
    await pool.query('UPDATE usuarios SET pin_hash = NULL WHERE id = ?', [usuario.id]);

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      getJwtSecret(), // ⚡ Llamada estricta
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

// PUT /api/auth/pin
async function setPin(req, res) {
  const { pin } = req.body;

  // ⚡ EXPIRACIÓN DEL PIN: Si el frontend manda null, borramos el PIN inmediatamente
  if (pin === null) {
    try {
      await pool.query('UPDATE usuarios SET pin_hash = NULL WHERE id = ?', [req.usuario.id]);
      return res.json({ ok: true, mensaje: 'PIN eliminado por expiración' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error al limpiar el PIN' });
    }
  }

  // Validación normal si es la creación de un PIN nuevo
  if (!pin || !/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: 'El PIN debe ser de exactamente 4 dígitos' });
  }

  try {
    const pinHash = await bcrypt.hash(pin, 10);
    await pool.query('UPDATE usuarios SET pin_hash = ? WHERE id = ?', [pinHash, req.usuario.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

// GET /api/auth/check-pin-status -> Comprueba si el usuario tiene PIN configurado (para el frontend)
async function checkPinStatus(req, res) {
  try {
    const [rows] = await pool.query('SELECT pin_hash FROM usuarios WHERE id = ?', [req.usuario.id]);
    
    // Si el pin_hash es null, significa que el reloj ya entró y lo destruyó
    if (rows.length > 0 && rows[0].pin_hash === null) {
      return res.json({ emparejado: true });
    }
    
    return res.json({ emparejado: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

// GET /api/auth/usuarios -> ⚡ NUEVA FUNCIÓN PARA OBTENER USUARIOS
async function obtenerUsuarios(req, res) {
  try {
    const [rows] = await pool.query('SELECT id, nombre, email, rol, creado_en FROM usuarios');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

// POST /api/auth/crear-usuario -> Creado por el administrador desde el panel
async function crearUsuarioAdmin(req, res) {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Faltan datos (nombre, email, password)' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const [existente] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existente.length > 0) {
      return res.status(409).json({ error: 'Ese email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRol = rol === 'admin' ? 'admin' : 'cliente';
    
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, passwordHash, userRol]
    );

    res.status(201).json({
      ok: true,
      id: result.insertId,
      nombre,
      email,
      rol: userRol
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
}

module.exports = { register, login, loginPin, setPin, checkPinStatus, obtenerUsuarios, crearUsuarioAdmin };