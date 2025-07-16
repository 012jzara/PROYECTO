const HistorialCita = require('../models/HistorialCita');

const obtenerHistorialPorCita = async (req, res) => {
  try {
    const { citaId } = req.params;
    const historial = await HistorialCita.find({ CitaId: citaId }).sort({ FechaCambio: -1 });
    res.json(historial);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener historial de cita' });
  }
};

module.exports = {
  obtenerHistorialPorCita
};
