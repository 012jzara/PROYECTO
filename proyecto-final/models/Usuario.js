const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsuarioSchema = new mongoose.Schema({
    Usuario: {type: String, required: true, unique: true, trim: true },
    Contrasena: { type: String , required: true },
    NombreCompleto: { type: String, trim: true},
    Email: { type: String , trim: true, lowercase: true, unique: true },
    Telefono: { type: String, trim: true },
    Especialidad: { type: String, trim: true },
    NumeroColegiado: { type: String, trim: true },
    Rol: {type: String, enum: ['Admin', 'Veterinario', 'Caja', 'Inventario', 'Asistente', 'User'], default: 'User'},
    Activo:{type: Boolean, default: true}
}, {
    timestamps: true 
});

UsuarioSchema.pre('save', async function(next) {
    if (!this.isModified('Contrasena')) return next();
    const salt = await bcrypt.genSalt(10);
    this.Contrasena = await bcrypt.hash(this.Contrasena, salt);
    next();
});

UsuarioSchema.methods.validarPassword = async function(password) {
    return bcrypt.compare(password, this.Contrasena);
};

UsuarioSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.Contrasena;
    return user;
};

module.exports = mongoose.model('Usuario', UsuarioSchema);


