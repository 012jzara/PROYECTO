const mongoose = require('mongoose');

async function conectarMongo(uri) {
  try {
    await mongoose.connect(uri);
    console.log('Conectado a MongoDB');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
  }
}

module.exports = conectarMongo;