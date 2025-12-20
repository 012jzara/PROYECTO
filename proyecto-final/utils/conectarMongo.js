const mongoose = require('mongoose');

async function conectarMongo() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('❌ MONGO_URI no está definido en Render (Environment)');

  await mongoose.connect(uri);
  return mongoose;
}

module.exports = conectarMongo;
