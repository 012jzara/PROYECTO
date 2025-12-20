const mongoose = require('mongoose');
const Usuario = require('./Usuario');

const NotificacionSchema = new mongoose.Schema({
    UsuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null},
    Titulo: { type: String, required: true, trim: true },
    Tipo: { type: String, enum: ['Cita', 'Inventario', 'Finanzas', 'Sistema', 'Otros'], default: 'Sistema'},
    Mensaje: { type: String, required: true, trim: true },
    Nivel: {type: String, enum: ['info', 'advertencia', 'error', 'exito'], default: 'info'},
    Leido: { type: Boolean, default: false },
    ReferenciaId: {type: mongoose.Schema.Types.ObjectId, default: null},
    ModeloRelacionado: {type: String, enum: [ 'Cita', 'ProductoInsumo', 'Venta', 'Transaccion', 'Mascota', 'Cliente', 'Otro', null],
        default: null},
        Tienda: { type: String, enum:['BioPets_Mariategui', 'BioPets_Kennedy', null], default: null},
    Fecha: { type: Date, default: Date.now }
}, {
    timestamps: true
});
NotificacionSchema.index({ UsuarioId: 1, Leido: 1, Fecha: -1});

module.exports = mongoose.model('Notificacion', NotificacionSchema);
