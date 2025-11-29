const mongoose = require('mongoose');

const HistorialSchema = new mongoose.Schema({
    EstadoAnterior: {type: String },
    EstadoNuevo:{type: String },
    Motivo: {type: String },
    UsuarioResponsable:{type: String },
    Fecha: {type: Date, default: Date.now}
}, { _id: false });

const CitaSchema = new mongoose.Schema({
    EsClienteExistente: { type: Boolean, required: true },
    
    UsuarioResponsable: { type: String, required: true },

    NombrePropietario: { type: String, required: true },
    Contacto1: { type: String, required: true },
    Contacto2: { type: String }, // opcional

    NombrePaciente: { type: String, required: true },
    Especie: { type: String},
    Raza: { type: String},
    Sexo: { type: String, required: true, enum: ['Macho', 'Hembra', 'Desconocido'] },
    Caracter: { type: String},
    PatologiasPrevias: { type: String},

    Estado: { type: String, default: 'Programado', enum: ['Programado', 'Reprogramado', 'Cancelado', 'Finalizado'] },
    Especialista: { type: String, required: true },
    TipoEvento: { type: String, required: true },
    FechaInicio: { type: Date, required: true },
    FechaFin: { type: Date, required: true },
    Observaciones: { type: String },

    ClienteId: { type: mongoose.Schema.Types.Mixed },

    HistorialCambios: [HistorialSchema]
    
});

CitaSchema.path('FechaFin').validate(function(value) {
    return value >= this.FechaInicio;
}, 'La FechaFin debe ser mayor o igual a FechaInicio');

// MIDDLEWARE PARA GUARDAR AUTOMÁTICAMENTE CAMBIOS DE ESTADO

CitaSchema.pre('save', async function (next) {
    if (this.isNew) return next();
    // solo registra si es edición
     this._estadoAnterior = this.get('Estado', null, { getters: false });
    next();
});

// Para findOneAndUpdate()
CitaSchema.pre('findOneAndUpdate', async function (next) {
    const doc = await this.model.findOne(this.getQuery()).lean();
    if (doc) {
        this._estadoAnterior = doc.Estado;
        const update = this.getUpdate();
        const data = (update && update.$set) ? update.$set : update;

        this._usuarioCambio = data.UsuarioResponsable || doc.UsuarioResponsable;
        this._motivoCambio = data.Motivo || data.Observaciones || 'Actualización sin motivo';
    }
    next();
});

// registra cambios de estado
CitaSchema.post('save', async function (doc) {
    if (this.isNew) return;  
    if (!this.isModified('Estado')) return;

    doc.HistorialCambios.push({
        Fecha: new Date(),
        EstadoAnterior: this._estadoAnterior,
        EstadoNuevo: this.Estado,
        Motivo: this._motivoCambio || 'Actualización sin motivo',
        UsuarioResponsable: this._usuarioCambio || this.UsuarioResponsable || 'Sistema'
    });

    // Guardar sin volver a generar historial
    await doc.updateOne({ HistorialCambios: doc.HistorialCambios }, { new: false });
});


CitaSchema.post('findOneAndUpdate', async function (result) {
    if (!result) return;

    const estadoAnterior = this._estadoAnterior;
    const estadoNuevo = result.Estado;

    if (estadoAnterior === estadoNuevo) return; // No hay cambio real

    result.HistorialCambios.push({
        Fecha: new Date(),
        EstadoAnterior: estadoAnterior,
        EstadoNuevo: estadoNuevo,
        Motivo: this._motivoCambio || 'Actualización sin motivo',
        UsuarioResponsable: this._usuarioCambio || 'Sistema'
    });

    // Guardar sin activar middlewares
    await result.updateOne({ HistorialCambios: result.HistorialCambios }, { new: false });
});

module.exports = mongoose.model('Cita', CitaSchema);
