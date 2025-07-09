const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const citaRoutes = require('./routes/citas');
const clienteRoutes = require('./routes/clientes');
const productoRoutes = require('./routes/productos');
const propietarioRoutes = require('./routes/propietario');
const transaccionRoutes = require('./routes/transacciones');


const app = express();
app.use(cors());
app.use(express.json());

const conectarMongo = require('./utils/conectarMongo');
conectarMongo('mongodb://localhost:27017/biopets');

app.use('/api/citas', citaRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/productos', productoRoutes); // ❗ Aún no está incluido
app.use('/api/propietario', propietarioRoutes);
app.use('/api/transacciones', transaccionRoutes);


// Ruta base
app.get('/', (req, res) => {
    res.send('API funcionando correctamente desde Node.js');
});

// Ruta de login
const Usuario = require('./models/Usuario');

app.post('/api/login', (req, res) => {
    console.log("Body recibido:", req.body);

    const { usuario, contrasena } = req.body;


    // Simulación de login correcto
    if (usuario === 'admin' && contrasena === '1234') {
        return res.json({
            success: true,
            token: 'abc123',
            rol: 'admin'
        });
    }

    // Credenciales incorrectas
    res.status(401).json({
        success: false,
        message: 'Credenciales incorrectas'
    });
 });


const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0' ,() => {
    console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});
