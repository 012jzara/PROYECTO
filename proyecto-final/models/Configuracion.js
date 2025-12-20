const mongoose = require('mongoose');

const ConfigSchema = new mongoose.Schema({
    
    Clave: { type: String, required: true, unique: true,uppercase: true, trim: true,match: /^[A-Z0-9_.-]+$/},

    Valor: { type: mongoose.Schema.Types.Mixed,  required: true },

    Tipo: { type: String, enum: ["string", "number", "boolean", "json"],default: "string"},

    Descripcion: { type: String, default: "" },

    Tienda: { type: String, default: "GLOBAL"},

    Activo: { type: Boolean, default: true }

}, { timestamps: true });

module.exports = mongoose.model('Configuracion', ConfigSchema);
