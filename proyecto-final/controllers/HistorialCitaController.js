const HistorialCita = require('../models/HistorialCita');

const actualizarCita = async (req, res) => {
  try {
    const citaExistente = await Cita.findById(req.params.id);
    if (!citaExistente) {
      return res.status(404).json({ mensaje: 'Cita no encontrada' });
    }

    const nuevaData = req.body;

    if (nuevaData.Estado && nuevaData.Estado !== citaExistente.Estado) {
      const nuevoHistorial = new HistorialCita({
        CitaId: citaExistente._id,
        EstadoAnterior: citaExistente.Estado,
        EstadoNuevo: nuevaData.Estado,
        Motivo: nuevaData.Observaciones || 'Actualización manual',
        UsuarioResponsable: nuevaData.UsuarioResponsable || 'Admin'
      });
      await nuevoHistorial.save();
    }

    Object.assign(citaExistente, nuevaData);
    await citaExistente.save();

    res.json({ mensaje: 'Cita actualizada', cita: citaExistente });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al actualizar cita', error });
  }
};
