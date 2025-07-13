const mongoose = require('mongoose');

const MascotaSchema = new mongoose.Schema({
  nombre: String,
  especie: String,
  raza: String,
  sexo: String,
  caracter: String,
  patologias: String,
  propietarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' }
});

module.exports = mongoose.model('Mascota', MascotaSchema);