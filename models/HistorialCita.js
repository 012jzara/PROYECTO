const mongoose = require('mongoose');

const HistorialCitaSchema = new mongoose.Schema({
  EstadoAnterior: String,
  EstadoNuevo: String,
  Motivo: String,
  UsuarioResponsable: String,
  Fecha: { type: Date, default: Date.now },
  CitaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cita' }
});

module.exports = mongoose.model('HistorialCita', HistorialCitaSchema)