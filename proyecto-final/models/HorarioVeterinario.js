const mongoose = require('mongoose');

const HorarioVeterinarioSchema = new mongoose.Schema({
    Veterinario: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Usuario", 
        required: true 
    },

    DiaSemana: {
        type: String,
        enum: ['Lunes','Martes','Miercoles','Jueves','Viernes','Sabado','Domingo'],
        required: true
    },

    HoraInicio: { type: String, required: true, match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato inválido: HH:mm"]},
    HoraFin: { type: String, required: true, match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato inválido: HH:mm"] },
    Disponible: { type: Boolean, default: true }

}, { timestamps: true });

HorarioVeterinarioSchema.index(
    {Veterinario:1, DiaSemana:1, HoraInicio:1},
    {unique: true}
);

module.exports = mongoose.model('HorarioVeterinario', HorarioVeterinarioSchema);
