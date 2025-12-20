const mongoose = require('mongoose');

const MascotaSchema = new mongoose.Schema({
  Nombre: { type: String, required: true , trim: true },
  Especie: { type: String, enum: ['Perro', 'Gato', 'Otro'], default: 'Otro' },
  Raza: { type: String, trim: true },
  Color:{type: String, trim:true},
  Sexo: { type: String, enum: ['Macho', 'Hembra', 'Desconocido'], default:'Desconocido'},
  Caracter: { type: String, trim: true } ,
  Patologias: { type: [String], default: []},
  FechaNacimiento: { type: Date },
  Peso: { type: String, trim: true },       
  Talla: { type: String, trim: true },
  EstadoReproductivo: { type: String, trim: true },
  Alimentacion: { type: String, trim: true },

  Fallecido: { type: Boolean, default: false },

  Imagen: { type: String, trim: true },

  ClienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' ,  required: true }
},{
  timestamps: true
});

MascotaSchema.index({ Nombre: 1});
MascotaSchema.index({ClienteId: 1});

module.exports = mongoose.model('Mascota', MascotaSchema);  

