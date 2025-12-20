const mongoose = require('mongoose');

const HistoriaClinicaSchema = new mongoose.Schema({
    MascotaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mascota', required: true },
    CitaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cita', default: null},
    VeterinarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: null },
    CreadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },

    MotivoConsulta: { type: String, required: true },
    Diagnostico: { type: String },
    Tratamiento: { type: String },
    SignosVitales: {
        Peso: { type: Number },
        Temperatura: { type: Number },
        FrecuenciaCardiaca:{type: Number},
        FrecuenciaRespiratoria: {type: Number}
    },
    MedicamentosAplicados: [{ 
        Nombre: { type: String },
        Dosis:{ type: String },
        Via: { type: String },
        Observacion: { type: String }
    }],
    Adjuntos: [{
        NombreArchivo: { type: String },
        Url: { type: String },
        Tipo: { type: String },
        FechaSubida: {type: Date, default: Date.now}
    }],
    Observaciones: { type: String },

    Fecha: { type: Date, default: Date.now }
}, {
    timestamps: true
});
HistoriaClinicaSchema.index({ MascotaId: 1, Fecha: -1 });

module.exports = mongoose.model('HistoriaClinica', HistoriaClinicaSchema);
