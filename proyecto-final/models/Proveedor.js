const mongoose = require('mongoose');

const ProveedorSchema = new mongoose.Schema({
    Nombre: { type: String, required: true, trim: true },
    RUC: { type: String, trim: true, match: [/^\d{11}$/, 'ElRUC debe tener 11 digitos'], inique: true, sparse: true },
    Contacto: { type: String , trim: true},
    Telefono: { type: String, trim: true },
    Email: { type: String, trim: true },
    Direccion: { type: String , trim: true},
    Activo: { type: Boolean, default: true }
}, {
    timestamps: true
});

ProveedorSchema.index({Nombre: 1});

module.exports = mongoose.model('Proveedor', ProveedorSchema);
