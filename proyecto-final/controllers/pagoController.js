const mongoose = require('mongoose');
const Pago = require('../models/Pago');
const Transaccion = require('../models/Transaccion');

async function calcularTotalPagado(transaccionId) {
    if (!mongoose.Types.ObjectId.isValid(transaccionId)) return 0;
    const resultado = await Pago.aggregate([
        { $match: { TransaccionId: new require('mongoose').Types.ObjectId(transaccionId) } },
        { $group: { _id: null, total: { $sum: '$Monto' } } }
    ]);

    return resultado.length > 0 ? resultado[0].total : 0;
}

exports.crearPago = async (req, res) => {
    try {
        const { TransaccionId, Monto, Metodo, UsuarioId } = req.body;

        if (!TransaccionId || !Monto || !Metodo || !UsuarioId) {
            return res.status(400).json({ msg: 'TransaccionId, Monto, Metodo y UsuarioId son obligatorios' });
        }

        const transaccion = await Transaccion.findById(TransaccionId);
        if (!transaccion) {
            return res.status(404).json({ msg: 'Transacción no encontrada' });
        }

        if (transaccion.MetodoPago === 'Anulado') {
            return res.status(400).json({ 
                msg: 'No se pueden registrar pagos sobre una transacción anulada'
            });
        }

        if (transaccion.Tipo !== 'Ingreso') {
            return res.status(400).json({ msg: 'Solo se pueden registrar pagos sobre transacciones de tipo Ingreso' });
        }

        const montoPago = Number(Monto);
        if (Number.isNaN(montoPago) || montoPago <= 0) {
            return res.status(400).json({ msg: 'El monto del pago debe ser mayor a 0' });
        }

        const totalPagadoAntes = await calcularTotalPagado(TransaccionId);
        const totalPagadoDespues = totalPagadoAntes + montoPago;

        if (totalPagadoDespues - transaccion.Monto > 0.001) {
            return res.status(400).json({
                msg: 'El total pagado supera el monto de la transacción',
                montoTransaccion: transaccion.Monto,
                totalPagadoAntes,
                intentoTotal: totalPagadoDespues
            });
        }

        const pago = new Pago({
            TransaccionId,
            Monto: montoPago,
            Metodo,
            UsuarioId
        });

        await pago.save();

        let nuevoEstadoPago = 'Pendiente';
        if (Math.abs(totalPagadoDespues - transaccion.Monto) < 0.001) {
            nuevoEstadoPago = 'Pagado';
        }

        await Transaccion.findByIdAndUpdate(
            TransaccionId,
            { MetodoPago: nuevoEstadoPago },  
            { new: true }
        );

        res.status(201).json({
            msg: 'Pago registrado correctamente',
            pago,
            totalPagado: totalPagadoDespues,
            montoTransaccion: transaccion.Monto,
            estadoPago: nuevoEstadoPago
        });

    } catch (error) {
        console.error('Error al crear pago:', error);
        res.status(500).json({ msg: 'Error al crear pago', error: error.message });
    }
};

exports.obtenerPagos = async (req, res) => {
    try {
        const { transaccionId, usuarioId, metodo, desde, hasta } = req.query;
        const filtro = {};

        if (transaccionId) filtro.TransaccionId = transaccionId;
        if (usuarioId) filtro.UsuarioId = usuarioId;
        if (metodo) filtro.Metodo = metodo;

        if (desde || hasta) {
            filtro.Fecha = {};
            if (desde) filtro.Fecha.$gte = new Date(desde);
            if (hasta) filtro.Fecha.$lte = new Date(hasta + 'T23:59:59');
        }

        const pagos = await Pago.find(filtro)
            .populate('TransaccionId')
            .populate('UsuarioId', 'Usuario NombreCompleto Rol')
            .sort({ Fecha: -1 });

        res.json(pagos);

    } catch (error) {
        console.error('Error al obtener pagos:', error);
        res.status(500).json({ msg: 'Error al obtener pagos', error: error.message });
    }
};

exports.obtenerPagoPorId = async (req, res) => {
    try {
        const pago = await Pago.findById(req.params.id)
            .populate('TransaccionId')
            .populate('UsuarioId', 'Usuario NombreCompleto Rol');

        if (!pago) {
            return res.status(404).json({ msg: 'Pago no encontrado' });
        }

        res.json(pago);

    } catch (error) {
        console.error('Error al obtener pago:', error);
        res.status(500).json({ msg: 'Error al obtener pago', error: error.message });
    }
};

exports.obtenerPagosPorTransaccion = async (req, res) => {
    try {
        const { transaccionId } = req.params;

        const pagos = await Pago.find({ TransaccionId: transaccionId })
            .populate('UsuarioId', 'Usuario NombreCompleto Rol')
            .sort({ Fecha: -1 });

        res.json(pagos);

    } catch (error) {
        console.error('Error al obtener pagos por transacción:', error);
        res.status(500).json({ msg: 'Error al obtener pagos por transacción', error: error.message });
    }
};

exports.eliminarPago = async (req, res) => {
    try {
        const pago = await Pago.findById(req.params.id);
        if (!pago) {
            return res.status(404).json({ msg: 'Pago no encontrado' });
        }

        const transaccion = await Transaccion.findById(pago.TransaccionId);
        if (!transaccion) {
            return res.status(404).json({ msg: 'Transacción asociada no encontrada' });
        }

        await pago.deleteOne();

        const totalPagadoDespues = await calcularTotalPagado(transaccion._id.toString());

        let nuevoEstadoPago = 'Pendiente';
        if (Math.abs(totalPagadoDespues - transaccion.Monto) < 0.001) {
            nuevoEstadoPago = 'Pagado';
        }

        await Transaccion.findByIdAndUpdate(
            transaccion._id,
            { MetodoPago: nuevoEstadoPago },
            { new: true }
        );

        res.json({
            msg: 'Pago eliminado y estado de transacción actualizado',
            totalPagado: totalPagadoDespues,
            estadoPago: nuevoEstadoPago
        });

    } catch (error) {
        console.error('Error al eliminar pago:', error);
        res.status(500).json({ msg: 'Error al eliminar pago', error: error.message });
    }
};
