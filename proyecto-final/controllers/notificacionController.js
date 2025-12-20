const Notificacion = require('../models/Notificacion');

exports.crearNotificacion = async (req, res) => {
    try {
        const {
            UsuarioId = null,
            Titulo,
            Mensaje,
            Tipo = 'Sistema',
            Nivel = 'info',
            ReferenciaId = null,
            ModeloRelacionado = null,
            Tienda = null
        } = req.body;

        if (!Titulo || !Mensaje) {
            return res.status(400).json({ msg: 'Título y mensaje son obligatorios' });
        }

        const notificacion = new Notificacion({
            UsuarioId,
            Titulo,
            Mensaje,
            Tipo,
            Nivel,
            ReferenciaId,
            ModeloRelacionado,
            Tienda
        });

        await notificacion.save();

        res.status(201).json({
            msg: 'Notificación creada correctamente',
            notificacion
        });

    } catch (error) {
        console.error('Error al crear notificación:', error);
        res.status(500).json({ msg: 'Error al crear notificación', error: error.message });
    }
};

exports.obtenerNotificaciones = async (req, res) => {
    try {
        const { usuarioId, tipo, nivel, leido, tienda, desde, hasta } = req.query;

        const filtro = {};

        if (usuarioId) filtro.UsuarioId = usuarioId;
        if (tipo) filtro.Tipo = tipo;
        if (nivel) filtro.Nivel = nivel;
        if (tienda) filtro.Tienda = tienda;

        if (leido === 'true') filtro.Leido = true;
        if (leido === 'false') filtro.Leido = false;

        if (desde || hasta) {
            filtro.Fecha = {};
            if (desde) filtro.Fecha.$gte = new Date(desde);
            if (hasta) filtro.Fecha.$lte = new Date(hasta + 'T23:59:59');
        }

        const notificaciones = await Notificacion.find(filtro)
            .populate('UsuarioId', 'Usuario NombreCompleto Rol')
            .sort({ Fecha: -1 });

        res.json(notificaciones);

    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({ msg: 'Error al obtener notificaciones', error: error.message });
    }
};

exports.obtenerMisNotificaciones = async (req, res) => {
    try {
        const usuarioId = req.user.id;
        const { soloNoLeidas } = req.query;

        const filtro = {
            $or: [
                { UsuarioId: usuarioId }, 
                { UsuarioId: null }      
            ]
        };

        if (soloNoLeidas === 'true') {
            filtro.Leido = false;
        }

        const notificaciones = await Notificacion.find(filtro)
            .sort({ Fecha: -1 });

        res.json(notificaciones);

    } catch (error) {
        console.error('Error al obtener mis notificaciones:', error);
        res.status(500).json({ msg: 'Error al obtener tus notificaciones', error: error.message });
    }
};

exports.contarNoLeidas = async (req, res) => {
    try {
        const usuarioId = req.user.id;

        const count = await Notificacion.countDocuments({
            $or: [
                { UsuarioId: usuarioId },
                { UsuarioId: null }
            ],
            Leido: false
        });

        res.json({ noLeidas: count });

    } catch (error) {
        console.error('Error al contar no leídas:', error);
        res.status(500).json({ msg: 'Error al contar notificaciones', error: error.message });
    }
};

exports.marcarComoLeida = async (req, res) => {
    try {
        const { id } = req.params;

        const notificacion = await Notificacion.findById(id);
        if (!notificacion) {
            return res.status(404).json({ msg: 'Notificación no encontrada' });
        }

        if (notificacion.UsuarioId && notificacion.UsuarioId.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'No tienes permiso para modificar esta notificación' });
        }

        notificacion.Leido = true;
        await notificacion.save();

        res.json({ msg: 'Notificación marcada como leída', notificacion });

    } catch (error) {
        console.error('Error al marcar como leída:', error);
        res.status(500).json({ msg: 'Error al marcar notificación', error: error.message });
    }
};

exports.marcarTodasComoLeidas = async (req, res) => {
    try {
        const usuarioId = req.user.id;

        const resultado = await Notificacion.updateMany(
            {
                $or: [
                    { UsuarioId: usuarioId },
                    { UsuarioId: null }
                ],
                Leido: false
            },
            { $set: { Leido: true } }
        );

        res.json({
            msg: 'Notificaciones marcadas como leídas',
            modificadas: resultado.modifiedCount
        });

    } catch (error) {
        console.error('Error al marcar todas como leídas:', error);
        res.status(500).json({ msg: 'Error al actualizar notificaciones', error: error.message });
    }
};

exports.eliminarNotificacion = async (req, res) => {
    try {
        const { id } = req.params;

        const notificacion = await Notificacion.findByIdAndDelete(id);
        if (!notificacion) {
            return res.status(404).json({ msg: 'Notificación no encontrada' });
        }

        res.json({ msg: 'Notificación eliminada correctamente' });

    } catch (error) {
        console.error('Error al eliminar notificación:', error);
        res.status(500).json({ msg: 'Error al eliminar notificación', error: error.message });
    }
};
