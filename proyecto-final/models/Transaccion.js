const mongoose = require('mongoose');

const TransaccionSchema = new mongoose.Schema({

  Tipo: { type: String, enum: ['Ingreso', 'Egreso'], required: true },
  Subtipo: { type: String , enum: ['Venta', 'Compra', 'PagoServicios', 'PagoProveedor', 'Sueldo', 'AjusteInventario', 'Transferencia', 'Otro' ], default: 'Otro' },
  Categoria: {type: String, trim: true}, 
  Descripcion: { type: String,maxlength: 300,default: ''},
  Monto: { type: Number , required: true , min: 0.01 },
  Moneda: { type: String , enum: ['PEN' , 'USD'], default: 'PEN' },
  MetodoPago:{ type: String , enum: ['Pendiente', 'Pagado', 'Anulado'], default: 'Pendiente'},
  Fecha: { type: Date, default: Date.now },
  IdRelacionado: {type: mongoose.Schema.Types.ObjectId, default: null },
  ModeloRelacionado: { type: String, enum: ['Venta', 'Compra', 'Proveedor', 'Cliente', null] , default: null },
  Usuario: {type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' , require: false }
  
}, {
  timestamps: true
});
TransaccionSchema.index({ Fecha: 1 });
TransaccionSchema.index({ Tipo: 1, Subtipo: 1 });
TransaccionSchema.index({ ModeloRelacionado: 1, IdRelacionado: 1 });

module.exports = mongoose.model('Transaccion', TransaccionSchema);


