const mongoose = require('mongoose');

const HistorialCitaSchema = new mongoose.Schema({
  CitaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cita', required: true},
  EstadoAnterior: {type: String, trim: true },
  EstadoNuevo: {type: String, trim: true },
  Motivo: { type: String, trim:true, default: '' },
  UsuarioResponsable: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario',  required: false },
  FechaCambio: { type: Date, default: Date.now }
},{
  timestamps: true
});

HistorialCitaSchema.index({CitaId: 1});
module.exports = mongoose.model('HistorialCita', HistorialCitaSchema);

