const HistorialCita = require('../models/HistorialCita');

exports.crearHistorial = async (req, res) => {
  try {
    const { CitaId, EstadoAnterior, EstadoNuevo, Motivo, UsuarioResponsable } = req.body;

    if (!CitaId || !EstadoNuevo) {
      return res.status(400).json({ msg: 'CitaId y EstadoNuevo son obligatorios' });
    }

    const registro = new HistorialCita({
      CitaId,
      EstadoAnterior: EstadoAnterior||'',
      EstadoNuevo,
      Motivo: Motivo||'',
      UsuarioResponsable: UsuarioResponsable||null
    });

    await registro.save();
    res.status(201).json(registro);
  } catch (error) {
    console.error('Error crear historial de cita:', error);
    res.status(500).json({ msg: 'Error al crear historial' });
  }
};

exports.obtenerHistorial = async (req, res) => {
  try {
    const lista = await HistorialCita.find()
      .sort({ FechaCambio: -1 })
      .populate('CitaId')  
      .populate('UsuarioResponsable', 'NombreCompleto Usuario Rol'); 
    res.json(lista);
  } catch (error) {
    console.error('Error obtener historial de citas:', error);
    res.status(500).json({ msg: 'Error al obtener historial' });
  }
};

exports.obtenerHistorialPorCita = async (req, res) => {
  try {
    const { citaId } = req.params;
    const lista = await HistorialCita.find({ CitaId: citaId })
      .sort({ FechaCambio: -1 })
      .populate('UsuarioResponsable', 'NombreCompleto Usuario Rol'); 
    res.json(lista);
  } catch (error) {
    console.error('Error obtener historial por cita:', error);
    res.status(500).json({ msg: 'Error al obtener historial por cita' });
  }
};

exports.obtenerPorRangoFechas = async (req, res) => {
  try {
    const { inicio, fin } = req.query;
    if (!inicio || !fin)
      return res.status(400).json({ msg: 'Se requieren fechas inicio y fin' });

    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);
    fechaFin.setHours(23, 59, 59, 999);

    const lista = await HistorialCita.find({
      FechaCambio: { $gte: fechaInicio, $lte: fechaFin }
    })
      .sort({ FechaCambio: -1 })
      .populate('CitaId')
      .populate('UsuarioResponsable', 'NombreCompleto Usuario Rol');

    res.json(lista);
  } catch (error) {
    console.error('Error obtener historial por rango:', error);
    res.status(500).json({ msg: 'Error al obtener historial por rango' });
  }
};

exports.eliminarHistorial = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await HistorialCita.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ msg: 'Registro no encontrado' });
    res.json({ msg: 'Historial eliminado', doc });
  } catch (error) {
    console.error('Error eliminar historial:', error);
    res.status(500).json({ msg: 'Error al eliminar historial' });
  }
};

exports.eliminarHistorialDeCita = async (req, res) => {
  try {
    const { citaId } = req.params;
    const result = await HistorialCita.deleteMany({ CitaId: citaId });
    res.json({ msg: 'Historiales eliminados', deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error eliminar historiales de cita:', error);
    res.status(500).json({ msg: 'Error al eliminar historiales de cita' });
  }
};
