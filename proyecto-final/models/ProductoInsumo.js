const mongoose = require('mongoose');

const LoteSchema = new mongoose.Schema({
  NumeroLote: { type: String },
  FechaCaducidad: { type: Date },
  Stock: { type: Number, default: 0 },
  PrecioCompra: { type: Number },    
  FechaIngreso: { type: Date, default: Date.now },
});

const StockTiendaSchema = new mongoose.Schema({
  Tienda: {
    type: String,
    enum: ['BioPets_Mariategui', 'BioPets_Kennedy'],
    required: true
  },

  Ubicacion: {
    type: String,
    enum: ['Tienda', 'Bodega'],
    default: 'Tienda'
  },

  StockActual: { type: Number, default: 0 },
  StockMinimo: { type: Number, default: 0 },
  StockMaximo: { type: Number, default: 0 },

  // Lotes específicos por tienda
  Lotes: [LoteSchema],

  CostoPromedioTienda: { type: Number, default: 0 }
});

const ProductoInsumoSchema = new mongoose.Schema({
  Nombre: { type: String, required: true, trim: true }, 
  Categoria: { type: String, enum: ['Producto', 'Insumo'], required: true },
  Subcategoria: {type: String, enum: ['Antibiotico', 'Antiparasitario', 'Antiinflamatorio', 'Analgesico', 'Vacuna', 'Suplemento', 'Higiene_y_Cuidado', 'Accesorio', 'Alimento', 'Material_Descartable', 'Equipo'] , required: true },
  ProveedorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor' },
  Descripcion: { type: String },
  Unidadmedida: { type: String },
  PrecioCompra: {type: Number},
  PrecioVenta: { type: Number , required: true },
  StockTotal: { type: Number, default: 0 },
  CostoPromedioGlobal: { type: Number, default: 0 },
  ValorTotalInventario: { type: Number, default: 0 },
  Tiendas:[StockTiendaSchema],  
  Estadoproducto: {type: String , enum: ['Nuevo', 'Usado' , 'Defectuoso'] },
  NumeroSerie: { type: String },
  Garantia: { type: String },

}, {
  timestamps: true
});

ProductoInsumoSchema.index({ Nombre: 1 });
ProductoInsumoSchema.index({ Categoria: 1, Subcategoria: 1 });
ProductoInsumoSchema.index({ 'Tiendas.Tienda': 1 });

module.exports = mongoose.model('ProductoInsumo', ProductoInsumoSchema);
  
