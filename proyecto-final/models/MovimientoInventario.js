const mongoose = require('mongoose');

const MovimientoInventarioSchema = new mongoose.Schema({
    ProductoId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductoInsumo', required: true },
    Tipo: { type: String, enum: ['Entrada', 'Salida', 'Ajuste', 'Transferencia'], required: true },
    Cantidad: { type: Number, required: true },

    Motivo: { type: String, required: true },    
    ReferenciaId: { type: mongoose.Schema.Types.ObjectId }, 
    Tienda: { type: String, required: true },

    UsuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    Fecha: { type: Date, default: Date.now },
    Nota: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('MovimientoInventario', MovimientoInventarioSchema);
