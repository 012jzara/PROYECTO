const mongoose = require('mongoose');
const { seedAdminIfMissing } = require('./seed/seedAdmin');

const PORT = process.env.PORT || 3000;

conectarMongo()
  .then(async () => {
    console.log('✅ Conectado a MongoDB');

    await seedAdminIfMissing();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error al conectar a MongoDB:', err);
    process.exit(1);
  });
