const HistoriaClinica = require('../models/HistoriaClinica');
const Mascota = require('../models/Mascota');
const mongoose = require('mongoose');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.crearHistoria = async (req, res) => {
    try {
    const {
      MascotaId,
      CitaId,
      VeterinarioId,
      MotivoConsulta,
      Diagnostico,
      Tratamiento,
      SignosVitales,
      MedicamentosAplicados,
      Adjuntos,
      Observaciones
    } = req.body;

    if (!MascotaId || !MotivoConsulta) {
      return res.status(400).json({ msg: 'MascotaId y MotivoConsulta son obligatorios' });
    }

    if (!isValidId(MascotaId)) {
      return res.status(400).json({ msg: 'MascotaId inválido' });
    }
    
    const mascota = await Mascota.findById(MascotaId);
    if (!mascota) {
      return res.status(404).json({ msg: 'Mascota no encontrada' });
    }

    const creadoPor = req.user?.id;
    if (!creadoPor) {
      return res.status(401).json({ msg: 'Usuario no autenticado' });
    }

    const historia = new HistoriaClinica({
      MascotaId,
      CitaId: CitaId || null,
      VeterinarioId: VeterinarioId || null,
      CreadoPor: creadoPor,
      MotivoConsulta,
      Diagnostico,
      Tratamiento,
      SignosVitales,
      MedicamentosAplicados,
      Adjuntos,
      Observaciones,
      Fecha: new Date()
    });

    await historia.save();

    res.status(201).json({ msg: 'Historia clínica creada', historia });

  } catch (error) {
    console.error(error);
        res.status(500).json({ msg: "Error al crear historia clínica", error });
    }
};

exports.obtenerHistorias = async (req, res) => {
    try {
        const historias = await HistoriaClinica.find()
            .populate("MascotaId")
            .populate("VeterinarioId", "NombreCompleto Usuario")
            .populate("CreadoPor", "NombreCompleto Usuario")
            .sort({ Fecha: -1 });

        res.json(historias);

    } catch (error) {
    console.error(error);
        res.status(500).json({ msg: "Error al obtener historias", error });
    }
};

exports.obtenerHistoriaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidId(id)) {
        return res.status(400).json({ msg: 'ID inválido' });
        }

        const historia = await HistoriaClinica.findById(req.params.id)
            .populate("MascotaId")
            .populate("VeterinarioId")
            .populate("CreadoPor");

        if (!historia)
            return res.status(404).json({ msg: "Historia no encontrada" });

        res.json(historia);

    } catch (error) {
    console.error(error);
        res.status(500).json({ msg: "Error al obtener historia", error });
    }
};

exports.obtenerHistoriaPorMascota = async (req, res) => {
    try {
        const { mascotaId } = req.params;

        if (!isValidId(mascotaId)) {
        return res.status(400).json({ msg: 'MascotaId inválido' });
        }
        const historias = await HistoriaClinica.find({ MascotaId: mascotaId })
            .sort({ Fecha: -1 })
            .populate("VeterinarioId", "NombreCompleto Usuario")
        .populate('CreadoPor', 'NombreCompleto Usuario');

        res.json(historias);

    } catch (error) {
    console.error(error);
        res.status(500).json({ msg: "Error al obtener historial", error });
    }
};

exports.actualizarHistoria = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
        return res.status(400).json({ msg: 'ID inválido' });
        }
        const historia = await HistoriaClinica.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );

        if (!historia) {
        return res.status(404).json({ msg: 'Historia no encontrada' });
        }

        res.json({ msg: "Historia clínica actualizada", historia });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al actualizar historia", error });
    }
};

exports.eliminarHistoria = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
        return res.status(400).json({ msg: 'ID inválido' });
        }

        const historia = await HistoriaClinica.findByIdAndDelete(req.params.id);
        if (!historia) {
        return res.status(404).json({ msg: 'Historia no encontrada' });
        }
        res.json({ msg: "Historia clínica eliminada" });        

    } catch (error) {
    console.error(error);
        res.status(500).json({ msg: "Error al eliminar historia", error });
    }
};
