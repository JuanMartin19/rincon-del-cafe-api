const pool = require('../db/pool');

async function obtenerMetricas(req, res) {
  try {
    // 1. Obtener ingresos totales y conteo de pedidos
    // ⚡ CAMBIO: Ahora busca la columna 'precio' tal como está en tu diagrama
    const [[totales]] = await pool.query('SELECT SUM(precio) as ingresos, COUNT(id) as total_pedidos FROM pedidos');

    // 2. Obtener ventas agrupadas por día (Últimos 7 días)
    // ⚡ CAMBIO: Aquí también busca 'precio'
    const [grafica] = await pool.query(`
      SELECT DATE(creado_en) as fecha, SUM(precio) as total
      FROM pedidos
      GROUP BY DATE(creado_en)
      ORDER BY fecha DESC
      LIMIT 7
    `);

    // Invertimos para que la gráfica vaya de más antiguo a más reciente (izquierda a derecha)
    grafica.reverse();

    // 3. Distribución de productos en el catálogo
    const [categorias] = await pool.query(`
      SELECT categoria as name, COUNT(id) as total
      FROM productos
      GROUP BY categoria
    `);

    res.json({
      ingresos: totales.ingresos || 0,
      total_pedidos: totales.total_pedidos || 0,
      grafica: grafica.map(g => ({
        // Formatea la fecha a día corto (ej. "lun", "mar")
        fecha: new Date(g.fecha).toLocaleDateString('es-MX', { weekday: 'short' }),
        total: Number(g.total)
      })),
      categorias
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
}

module.exports = { obtenerMetricas };