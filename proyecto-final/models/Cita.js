const mongoose = require('mongoose');

const HistorialSchema = new mongoose.Schema({
    EstadoAnterior: {type: String },
    EstadoNuevo:{type: String },
    Motivo: {type: String },
    UsuarioResponsable:{type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    FechaCambio: {type: Date, default: Date.now}
}, { _id: false });

const CitaSchema = new mongoose.Schema({
    EsClienteExistente: { type: Boolean, required: true },
    
    UsuarioResponsable: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },

    ClienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', default: null },
    PacienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mascota', default: null},
    VeterinarioId: {type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
    Especialista: { type:  mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    NombrePropietario: { type: String, required: true },
    Contacto1: { type: String, required: true },
    Contacto2: { type: String },

    NombrePaciente: { type: String, required: true },
    Especie: { type: String},
    Raza: { type: String},
    Sexo: { type: String, required: true, enum: ['Macho', 'Hembra', 'Desconocido'] },
    Caracter: { type: String},
    PatologiasPrevias: { type: String},

    Estado: { type: String, default: 'Programado', enum: ['Programado', 'Reprogramado', 'Cancelado', 'Finalizado'] },
    
    TipoEvento: { type: String, required: true },
    Sede: { type: String, required: false }, 
    FechaInicio: { type: Date, required: true },
    FechaFin: { type: Date, required: true },
    Observaciones: { type: String },

    VentaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venta', default: null },

    HistorialCambios: { type: [HistorialSchema] , default: [] },
    
}, {
    timestamps: true
});

CitaSchema.path('FechaFin').validate(function(value) {
    if (!this.FechaInicio) return true;
    return value >= this.FechaInicio;
}, 'La FechaFin debe ser mayor o igual a FechaInicio');

CitaSchema.index({  FechaInicio: 1 });
CitaSchema.index({ Especialista: 1, FechaInicio: 1 });

CitaSchema.pre('findOneAndUpdate', async function (next) {
    try {
        const doc = await this.model.findOne(this.getQuery()).lean();
        if (!doc) return next();

        this._originalEstado = doc.Estado;

        const update = this.getUpdate();
        const set = update?.$set || update || {};

        this._usuarioCambio = set.UsuarioResponsable || doc.UsuarioResponsable;
        this._motivoCambio = set.Motivo || set.Observaciones || doc.Observaciones;
    } catch (err) {
        console.error('pre findOneAndUpdate error:', err);
    }
    next();
});

CitaSchema.post('findOneAndUpdate', async function (result) {
    try {
        if (!result) return;

        const original = this._originalEstado;
        const nuevo = result.Estado;

        if (original === nuevo) return;

        const entry = {
            EstadoAnterior: original,
            EstadoNuevo: nuevo,
            Motivo: this._motivoCambio,
            UsuarioResponsable: this._usuarioCambio,
            FechaCambio: new Date()
        };

        await this.model.updateOne(
            { _id: result._id },
            { $push: { HistorialCambios: entry } }
        );
    } catch (err) {
        console.error('post findOneAndUpdate error:', err);
    }
});

module.exports = mongoose.model('Cita', CitaSchema);


