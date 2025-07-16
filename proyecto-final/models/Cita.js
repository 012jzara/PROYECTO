
const CitaSchema = new mongoose.Schema({
    EsClienteExistente: Boolean,
    NombrePropietario: String,
    Contacto1: String,
    Contacto2: String,

    NombrePaciente: String,
    Especie: String,
    Raza: String,
    Sexo: String,
    Caracter: String,
    PatologiasPrevias: String,

    Estado: {type: String, default: 'Programado'},
    Especialista: String,
    TipoEvento: String,
    FechaInicio: Date,
    FechaFin: Date,
    Observaciones: String,

    ClienteId: String,
    HistorialCambios: [
        {
        Fecha: { type: Date, default: Date.now },
        EstadoAnterior: String,
        EstadoNuevo: String,
        Motivo: String,
        UsuarioResponsable: String
    }
    ]
});


module.exports = mongoose.model('Cita', CitaSchema);
