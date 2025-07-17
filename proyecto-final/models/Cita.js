const mongoose = require('mongoose');

const historialSchema = new mongoose.Schema({
  FechaCambio: { type: Date, default: Date.now },
  EstadoAnterior: String,
  EstadoNuevo: String,
  Motivo: String,
  UsuarioResponsable: String
}, { _id: false });

const CitaSchema = new mongoose.Schema({
  EsClienteExistente: Boolean,
  NombrePropietario: String,
  Contacto1: String,
  Contacto2: String,

  NombrePaciente: String,
  Especie: String,
  Raza: String,
  Sexo: String,
  Caracter: String,
  PatologiasPrevias: String,

  Estado: { type: String, default: 'Programado' },
  Especialista: String,
  TipoEvento: String,
  FechaInicio: Date,
  FechaFin: Date,
  Observaciones: String,

  ClienteId: { type: String, default: null },
  UsuarioResponsable: String,

  HistorialCambios: [historialSchema]

}, { strict: true }); // Puedes quitar `strict` o dejarlo si todo está bien definido

module.exports = mongoose.model('Cita', CitaSchema);

