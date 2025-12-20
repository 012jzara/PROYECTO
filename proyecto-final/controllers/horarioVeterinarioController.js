const Horario = require('../models/HorarioVeterinario');
const mongoose = require('mongoose');
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.crearHorario = async (req , res) => {
    try {
        const {Veterinario, DiaSemana, HoraInicio, HoraFin ,Disponible } = (req.body);
        if (!Veterinario || !DiaSemana || !HoraInicio || !HoraFin) {
      return res.status(400).json({ msg: 'Veterinario, DiaSemana, HoraInicio y HoraFin son obligatorios.' });
    }

    if (!isValidId(Veterinario)) {
      return res.status(400).json({ msg: 'Id de veterinario inválido.' });
    }

    if(HoraFin<=HoraInicio)
        return res.status(400).json({msg: "La HoraFin debe ser mayor que HoraInicio."});

    const conflicto = await Horario.findOne({ Veterinario, DiaSemana, $or: [{HoraInicio: {$lt: HoraFin}, HoraFin:{$gt: HoraInicio}}
    ]});

    if(conflicto){
        return res.status(400).json({msg: "Conflicto: el horario se traslapa con otro existente.", conflicto});
        }
    const nuevo = new Horario({
         Veterinario,
      DiaSemana,
      HoraInicio,
      HoraFin,
      Disponible: Disponible !== undefined ? Disponible : true
    });
        await nuevo.save();
         res.status(201).json({ msg: 'Horario creado correctamente', horario: nuevo });

    } catch (error) {
    console.error(error);
        res.status(500).json({msg: "Error al crear horario", error});
    }
};

exports.obtenerHorarios = async (req, res) => {
    try {
        const horarios = await Horario.find()
       .populate('Veterinario', "NombreCompleto Email Rol")
      .sort({ DiaSemana: 1, HoraInicio: 1 });

        res.json(horarios);

    } catch (error) {
        res.status(500).json({ msg: "Error al obtener horarios", error });
    }
};

exports.obtenerHorariosPorVeterinario = async (req, res) => {
    try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ msg: 'Id de veterinario inválido' });
    }

        const horarios = await Horario.find({Veterinario: id})
        .populate('Veterinario', "NombreCompleto Email Rol")
      .sort({ DiaSemana: 1, HoraInicio: 1 });
        res.json(horarios);

    } catch (error) {
        res.status(500).json({ msg: "Error al obtener horarios del veterinario", error });
    }
};

exports.obtenerHorarioPorId = async (req, res) => {
    try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ msg: 'Id inválido' });
    }

        const horario = await Horario.findById(id)
        .populate('Veterinario', "NombreCompleto Email Rol");

        if(!horario)
            return res.status(404).json({msg: "Horariono encontrado"});

        res.json(horario);
    } catch (error) {
        res.status(500).json ({msg: "Error al obtener horario", error});
    }
};

exports.actualizarHorario = async (req, res) => {
     try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ msg: 'Id inválido' });
    }

    const horarioActual = await Horario.findById(id);
    if (!horarioActual) {
      return res.status(404).json({ msg: 'Horario no encontrado' });
    }

    const Veterinario = req.body.Veterinario || horarioActual.Veterinario;
    const DiaSemana = req.body.DiaSemana || horarioActual.DiaSemana;
    const HoraInicio = req.body.HoraInicio || horarioActual.HoraInicio;
    const HoraFin = req.body.HoraFin || horarioActual.HoraFin;

    if (HoraFin <= HoraInicio) {
      return res.status(400).json({ msg: 'La HoraFin debe ser mayor que HoraInicio.' });
    }
        const conflicto = await Horario.findOne({
            _id: { $ne: id },
            Veterinario,
            DiaSemana,
            HoraInicio: { $lt: HoraFin }, 
            HoraFin: { $gt: HoraInicio } 
            
        });

        if (conflicto)
            return res.status(400).json({ msg: "Conflicto de horarios", conflicto });

        const horario = await Horario.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        ).populate('Veterinario', 'NombreCompleto Email Rol');

        res.json({ msg: "Horario actualizado", horario });

    } catch (error) {
        res.status(500).json({ msg: "Error al actualizar horario", error });
    }
};

exports.eliminarHorario = async (req, res) => {
    try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ msg: 'Id inválido' });
    }
        const eliminado = await Horario.findByIdAndDelete(id);
         if (!eliminado) {
      return res.status(404).json({ msg: 'Horario no encontrado' });
    }
        res.json({ msg: "Horario eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ msg: "Error al eliminar horario", error });
    }
};