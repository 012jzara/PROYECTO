const mongoose = require('mongoose');

const ServicioSchema = new mongoose.Schema({
    Nombre: { type: String, required: true, trim : true},
    Descripcion: { type: String, trim: true},
    Precio: { type: Number, required: true , min: 0},
    Categoria: { type: String, enum: ['Consulta', 'Vacuna', 'Cirugia', 'Grooming', 'Baño', 'Otros'], required: true },
    Tienda:{type: String, enum:['BioPets_Mariategui', 'BioPets_Kennedy', 'Ambas'], default:'Ambas'},
    Activo: { type: Boolean, default: true }
}, {
    timestamps: true
});

ServicioSchema.index({Nombre: 1, Categoria: 1, Tienda: 1},
    {unique: true}
)

module.exports = mongoose.model('Servicio', ServicioSchema);
