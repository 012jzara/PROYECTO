const mongoose = require('mongoose');

const LogAuditoriaSchema = new mongoose.Schema({
    UsuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    Accion: { type: String, required: true },
    Detalle: { type: String, default: "" },
    IP: {type: String},
    UserAgent: {type: String},
    Fecha: { type: Date, default: Date.now }
}, {
    timestamps: true
});

module.exports = mongoose.model('LogAuditoria', LogAuditoriaSchema);

