const request = require('supertest');
const app = require('./server'); // <- AQUÍ ESTÁ EL CAMBIO IMPORTANTE

describe('Validación de Conexiones: POST /api/auth/login', () => {
  
  test('Caso de error: Rechaza credenciales incorrectas con HTTP 401', async () => {
    const respuesta = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'correo_falso@rincondelcafe.com',
        password: 'passwordEquivocada'
      });

    expect(respuesta.statusCode).toBe(401);
    expect(respuesta.body).toHaveProperty('error');
  });

  test('Caso de éxito: Retorna JWT al enviar credenciales válidas', async () => {
    const respuesta = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'juan@correo.com', // Recuerda poner un correo real de tu base de datos local
        password: 'Samarripa11'      // Recuerda poner la contraseña real de tu base de datos local
      });

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body).toHaveProperty('token');
    expect(respuesta.body.usuario).toHaveProperty('rol');
  });

});