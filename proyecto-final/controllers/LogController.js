const Log = require('../models/LogAuditoria');

exports.registrarLog = async (req, res) => {
  try {
    const { Accion, Detalle = "" } = req.body;

    if (!Accion) {
      return res.status(400).json({ msg: 'Acción es obligatoria' });
    }

  
    const usuarioId = req.body.UsuarioId || req.user?.id || req.user?._id;
    if (!usuarioId) {
      return res.status(401).json({ msg: 'Usuario no autenticado' });
    }

    const nuevoLog = new Log({
      UsuarioId: usuarioId,
      Accion,
      Detalle,
      IP: req.ip,
      UserAgent: req.headers['user-agent']
    });

    await nuevoLog.save();
    return res.status(201).json(nuevoLog);
  } catch (error) {
    console.error('Error al guardar log:', error.message);
    return res.status(500).json({ error: 'Error al guardar el log' });
  }
};

exports.obtenerLogs = async (req, res) => {
    try {
    const page = parseInt(req.query.page ?? '1', 10);
    const limit = parseInt(req.query.limit ?? '50', 10);

        const logs = await Log.find()
        .populate("UsuarioId", "Usuario NombreCompleto Rol")
        .sort({Fecha: -1})
        .skip((page -1)* limit)
        .limit(Number(limit));
        res.json(logs);
    } catch (error) {
        console.error('Error al obtener logs:', error.message);
        res.status(500).json({ error: 'Error al obtener logs' });
    }
};

exports.obtenerLogsPorUsuario = async (req, res) => {
    try {
        const logs = await Log.find({ UsuarioId: req.params.usuario })
            .populate("UsuarioId", "Usuario NombreCompleto Rol")
            .sort({ Fecha: -1 });

        res.json(logs);

    } catch (error) {
        res.status(500).json({ error: "Error al obtener logs por usuario" });
    }
};

exports.obtenerLogsPorAccion = async (req, res) => {
    try {
        const logs = await Log.find({ Accion: req.params.accion })
            .populate("UsuarioId", "Usuario NombreCompleto Rol")
            .sort({ Fecha: -1 });

        res.json(logs);

    } catch (error) {
        res.status(500).json({ error: "Error al obtener logs por acción" });
    }
};

exports.ObtenerLogsPorRangoFechas = async (req, res) => {
    try {
        const { inicio, fin } = req.query;
        if (!inicio || !fin) {
            return res.status(400).json({ msg: "Debe enviar inicio y fin" });
        }

        const logs = await Log.find({
            Fecha: {
                $gte: new Date(inicio),
                $lte: new Date(fin + "T23:59:59")
            }
        })
        .populate("UsuarioId", "Usuario NombreCompleto Rol")
        .sort({ Fecha: -1 });

        res.json(logs);

    } catch (error) {
        res.status(500).json({ error: "Error al obtener logs por rango" });
    }
};

module.exports = { 
    registrarLog, 
    obtenerLogs,
    obtenerLogsPorUsuario,
    obtenerLogsPorAccion,
    obtenerLogsPorRangoFechas
 };
