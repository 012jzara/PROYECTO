const mongoose = require('mongoose');

const LoteUsadoSchema = new mongoose.Schema({
  NumeroLote: { type: String },
  CantidadExtraida: { type: Number, required: true },
  PrecioCompra: { type: Number, required: true }
}, { _id: false });

const ItemVentaSchema = new mongoose.Schema({
  Tipo: { type: String, enum: ['Producto', 'Servicio'], default: 'Producto' },

  ProductoId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductoInsumo', required: true},
  ServicioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Servicio', default: null },

  Cantidad: {type: Number, required: true, min: 1
  },
  PrecioUnitario: { type: Number, required: true, min: 0
  },
  Subtotal: { type: Number, required: true,min: 0
  },
  LotesUsados: [LoteUsadoSchema] 
}, { _id: false });

const VentaSchema = new mongoose.Schema({
    ClienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', default: null },
    UsuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    CitaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cita', default: null },

    Tienda: {type: String,enum: ['BioPets_Mariategui', 'BioPets_Kennedy'],required: true},
    
    Items: { type: [ItemVentaSchema], validate: { validator: v => Array.isArray(v) && v.length > 0, message: 'La venta debe tener al menos un item'}},

    SubtotalGeneral: { type: Number, required: true, min: 0 },
    Descuento: { type: Number, default: 0 , min: 0},
    Total: { type: Number, required: true, min: 0 },
    Moneda: { type: String, enum: ['PEN', 'USD'], default: 'PEN' },
    MetodoPago: { type: String, enum: ['Efectivo', 'Tarjeta', 'Yape', 'Plin', 'Transferencia', 'Credito'], required: true },
    
    Estado: { type: String, enum: ['Pagado', 'Pendiente', 'Anulado'], default: 'Pagado' },
    Documento: {
        Serie: { type: String, default: null },
        Numero: { type: String, default: null },
        Tipo: { type: String, enum: ['Boleta', 'Factura', null], default: null }
    },
    Fecha: { type: Date, default: Date.now }

}, { timestamps: true });

module.exports = mongoose.model('Venta', VentaSchema);
