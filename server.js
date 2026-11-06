require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path'); 
const { Server } = require('socket.io');
const cors = require('cors');

// Importar rutas estáticas
const authRoutes = require('./routes/auth.routes');
const productosRoutes = require('./routes/productos.routes');
const contactoRoutes = require('./routes/contacto.routes');
const favoritosRoutes = require('./routes/favoritos.routes');
const carritoRoutes = require('./routes/carrito.routes');
const reportesRoutes = require('./routes/reportes.routes');
const promocionesRoutes = require('./routes/promociones.routes');

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://el-rincon-del-cafe-gray.vercel.app",
  "capacitor://localhost",
  "https://localhost",
  "http://localhost",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por la política CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

// Middleware básico
app.use(express.json());

// Hacer pública la carpeta 'uploads' para servir las imágenes locales
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas estáticas de tu API
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/contacto', contactoRoutes);
app.use('/api/favoritos', favoritosRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/promociones', promocionesRoutes);

// Crear servidor HTTP basado en Express
const server = http.createServer(app);

// Configuración de WebSockets con los mismos orígenes permitidos
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ⚡ IMPORTAR Y DECLARAR RUTAS QUE REQUIEREN 'io'
const pedidosRoutes = require('./routes/pedidos.routes')(io);
app.use('/api/pedidos', pedidosRoutes);

// ⚡ Rutas del chat individual por pedido
const chatRoutes = require('./routes/chat.routes')(io);
app.use('/api/chat', chatRoutes);

// Lógica de tiempo real
io.on('connection', (socket) => {
  // El cliente avisa a qué pedido entró, para meterlo a una "sala" privada
  socket.on('unirse_pedido', (pedidoId) => {
    socket.join(`pedido_${pedidoId}`);
  });

  socket.on('accion_telefono', (data) => {
    console.log('📱 Acción recibida del teléfono:', data);
    socket.broadcast.emit('actualizacion_tv', data); 
  });

  socket.on('datos_wearable', (data) => {
    socket.broadcast.emit('notificacion_telefono', data);
  });

  socket.on('disconnect', () => {
    // Desconexión limpia
  });
});

// Manejo de puerto
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`API REST y Servidor WebSocket corriendo en el puerto ${PORT}`);
});

module.exports = app;