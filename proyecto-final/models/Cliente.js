const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
    Nombre: { type: String, required: true, trim: true },
    Dni: { type: String, index: true },
    Contacto1: { type: String, required: true },
    Contacto2: { type: String }
    }, {
        timestamps: true
});

module.exports = mongoose.model('Cliente', ClienteSchema);

