const mongoose = require('mongoose');

const HistorialCitaSchema = new mongoose.Schema({
  CitaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cita' , required: true},
  EstadoAnterior: String,
  EstadoNuevo: String,
  Motivo: String,
  UsuarioResponsable: String,
  FechaCambio: { type: Date, default: Date.now },
});

module.exports = mongoose.model('HistorialCita', HistorialCitaSchema)
