const mongoose = require('mongoose');

const ProductoInsumoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  categoria: { type: String, enum: ['Producto', 'Insumo'], required: true },
  stock: { type: Number, default: 0 },
  fechaRegistro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProductoInsumo', ProductoInsumoSchema);
