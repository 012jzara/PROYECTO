const mongoose = require('mongoose');
require('dotenv').config();

const conectarMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a MongoDB por ngrok');
  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error.message);
  }
};

module.exports = conectarMongo;