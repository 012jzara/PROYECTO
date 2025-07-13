const mongoose = require('mongoose');

const MascotaSchema = new mongoose.Schema({
  Nombre: String,
  Especie: String,
  Raza: String,
  Sexo: String,
  Caracter: String,
  Patologias: String
}, { _id: false });

const PropietarioSchema = new mongoose.Schema({
  NombrePropietario: String,
  Telefono1: String,
  Telefono2: String,
  Identificador: String,
  Mascotas: [MascotaSchema]
});

module.exports = mongoose.model('Propietario', PropietarioSchema);