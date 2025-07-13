const mongoose = require('mongoose');

const TransaccionSchema = new mongoose.Schema({
  Tipo: { type: String, enum: ['Ingreso', 'Egreso'], required: true },
  Categoria: String,
  Descripcion: String,
  Monto: { type: Number, required: true },
  Fecha: { type: Date, default: Date.now },
  IdRelacionado: String
});

module.exports = mongoose.model('Transaccion', TransaccionSchema);


