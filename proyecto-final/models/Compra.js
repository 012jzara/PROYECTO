const mongoose = require('mongoose');

const CompraSchema = new mongoose.Schema({
    ProveedorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor', required: true },
    UsuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },

    Tienda: { type: String, enum: ['BioPets_Mariategui', 'BioPets_Kennedy'],required: true }, 
    
    Items: [{
        ProductoId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductoInsumo', required: true },
        Cantidad: { type: Number, required: true, min: 1},
        PrecioCompra: { type: Number, required: true, min: 0 },
        Subtotal: { type: Number, required: true, min: 0 }
    }],

    Total: { type: Number, required: true },
    Documento: { type: String, trim: true }, 
    Estado: { type: String, enum: ['Pagado', 'Pendiente', 'Anulado'], default: 'Pagado' },

    Fecha: { type: Date, default: Date.now }

}, { timestamps: true });

module.exports = mongoose.model('Compra', CompraSchema);
