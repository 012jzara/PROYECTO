const mongoose = require('mongoose');

const PagoSchema = new mongoose.Schema({
    TransaccionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaccion', required: true},
    Monto: { type: Number, required: true , min: 0.1},
    Metodo: { type: String, enum: ['Efectivo', 'Tarjeta', 'Transferencia', 'Yape', 'Plin'], required: true },
    UsuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' , required: true},

    Fecha: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('Pago', PagoSchema);
