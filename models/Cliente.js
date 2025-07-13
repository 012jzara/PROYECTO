const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
    nombre: String,
    dni: String,
    contacto1: String,
    contacto2: String,
    paciente: {
        nombre: String,
        especie: String,
        raza: String,
        sexo: String,
        caracter: String,
        patologias: String
    }
});

module.exports = mongoose.model('Cliente', ClienteSchema);
