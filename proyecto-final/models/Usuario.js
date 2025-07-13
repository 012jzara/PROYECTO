const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    usuario: String,
    contrasena: String,
    rol: String
});

module.exports = mongoose.model('Usuario', UsuarioSchema);
