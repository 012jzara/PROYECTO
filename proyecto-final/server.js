const express = require('express');
const cors = require('cors');
require('dotenv').config();
const conectarMongo = require('./utils/conectarMongo');

const app = express();

app.use(cors());
app.use(express.json());

const auth         = require('./routes/auth');  
const usuario     = require('./routes/usuario');  

const citas        = require('./routes/citas');
const clientes     = require('./routes/clientes');
const mascotas     = require('./routes/mascota');
const historiaCli  = require('./routes/historiaclinica');
const historialCita= require('./routes/historialCita');
const horarios     = require('./routes/horarioVeterinario');

const productos    = require('./routes/productoInsumo');
const movimientos  = require('./routes/movimientoInventario');
const compras      = require('./routes/compra');
const ventas       = require('./routes/ventas');
const proveedores  = require('./routes/Proveedor');
const reportesInv  = require('./routes/reporteInventario');

const servicios    = require('./routes/servicios');

const transacciones= require('./routes/transacciones');
const pagos        = require('./routes/pagos');

const config       = require('./routes/configuracion');
const logs         = require('./routes/logs');
const notificaciones = require('./routes/notificaciones');

app.use('/api/auth',      auth);
app.use('/api/usuarios',  usuario);

app.use('/api/citas',             citas);
app.use('/api/clientes',          clientes);
app.use('/api/mascotas',          mascotas);
app.use('/api/historiascli', historiaCli);
app.use('/api/historial-citas',   historialCita);
app.use('/api/horarios',          horarios);

app.use('/api/productos',         productos);
app.use('/api/inventario/movimientos', movimientos);
app.use('/api/compras',           compras);
app.use('/api/ventas',            ventas);
app.use('/api/proveedores',       proveedores);
app.use('/api/reportes/inventario', reportesInv);

app.use('/api/servicios',         servicios);

app.use('/api/transacciones',     transacciones);
app.use('/api/pagos',             pagos);

app.use('/api/config',            config);
app.use('/api/logs',              logs);
app.use('/api/notificaciones',    notificaciones);
conectarMongo(); 

app.get('/', (req, res) => {
    res.send('API funcionando correctamente desde Node.js');
});
app.use((req, res, next) => {
  res.status(404).json({ msg: 'Ruta no encontrada' });
});
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ msg: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;

conectarMongo()
  .then(() => {
    console.log(' Conectado a MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error al conectar a MongoDB:', err);
    process.exit(1);
  });

const { seedAdminIfMissing } = require('./seed/seedAdmin');

mongoose.connection.once('open', async () => {
  try {
    await seedAdminIfMissing();
  } catch (e) {
    console.error('❌ Error seed admin:', e.message);
  }
});
