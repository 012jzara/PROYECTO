const Transaccion = require('../models/Transaccion');

const crearTransaccion = async (req, res) => {
  try {
    const {
      Tipo,
      Subtipo,
      Categoria,
      Descripcion,
      Monto,
      Moneda,
      MetodoPago,
      Fecha,
      IdRelacionado,
      ModeloRelacionado,
      UsuarioId
    } = req.body;

    if (!Tipo || Monto == null) {
      return res.status(400).json({mensaje: 'Tipo y Monto son obligatorios'});
    }

    const transaccion = new Transaccion({
      Tipo,
      Subtipo,
      Categoria,
      Descripcion,
      Monto,
      Moneda,
      MetodoPago,
      Fecha,
      IdRelacionado,
      ModeloRelacionado,
      Usuario: UsuarioId ?? null
    });

    await transaccion.save();
    const creada = await Transaccion.findById(transaccion._id)
      .populate('Usuario', 'Nombre');
      const o = creada.toObject();
    res.status(201).json({
      ...o,
      UsuarioId: o.Usuario?._id ?? null,
      Usuario: o.Usuario?.Nombre ?? null
    });
  } catch (error) {
    console.error('Error al guardar transacción:', error);
    res.status(400).json({
      mensaje: 'Error al guardar transacción',
      error: error.message
    });
  }
};

const obtenerTransacciones = async (req, res) => {
  try {
    const {
      tipo,
      subtipo,
      modelo,
      usuarioId,
      metodoPago,
      desde,
      hasta
    } = req.query;

    const filtro = {};

    if (tipo) filtro.Tipo = tipo;
    if (subtipo) filtro.Subtipo = subtipo;
    if (modelo) filtro.ModeloRelacionado = modelo;
    if (usuarioId) filtro.Usuario = usuarioId;
    if (metodoPago) filtro.MetodoPago = metodoPago;

    if (desde || hasta) {
      filtro.Fecha = {};
      if (desde) filtro.Fecha.$gte = new Date(desde);
      if (hasta) filtro.Fecha.$lte = new Date(hasta + 'T23:59:59');
    }

    const lista = await Transaccion.find(filtro)
      .populate('Usuario', 'Nombre') 
      .sort({ Fecha: -1 });
    
    const salida = lista.map(t => {
      const o = t.toObject();
      return {
        ...o,
        UsuarioId: o.Usuario?._id ?? null,
        Usuario: o.Usuario?.Nombre ?? null  
      };
    });
    return res.json(lista);

  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({mensaje: 'Error al obtener transacciones',error: error.message
    });
  }
};

const obtenerTransaccionPorId = async (req, res) => {
  try {
    const item = await Transaccion.findById(req.params.id);
    if (!item){ return res.status(404).json({ mensaje: 'Transaccion no encontrada' });
  }
    res.json(item);
  } catch (error) {
    console.error('Error al buscar transacción:', error);
    res.status(500).json({
      mensaje: 'Error al buscar transacción',
      error: error.message
    });
  }
};

const actualizarTransaccion = async (req, res) => {
  try {
    const body ={...req.body};
    
    if (body.UsuarioId) body.Usuario = body.UsuarioId;
    const actualizada = await Transaccion.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true }
    ).populate('Usuario', 'Nombre');
    if (!actualizada) return res.status(404).json({ mensaje: 'Transaccion no encontrada' });
  }
      const o = actualizada.toObject();
    return res.json({
      ...o,
      UsuarioId: o.Usuario?._id ?? null,
      Usuario: o.Usuario?.Nombre ?? null
    });
  } catch (error) {
    console.error('Error al actualizar transacción:', error);
    return res.status(400).json({
      mensaje: 'Error al actualizar transacción',
      error: error.message
    });
  }
};

const eliminarTransaccion = async (req, res) => {
  try {
    const transaccion = await Transaccion.findById(req.params.id);
    if (!transaccion) {
      return res.status(404).json({ mensaje: 'Transacción no encontrada' });
    }
    transaccion.MetodoPago = 'Anulado';
    await transaccion.save();

    res.json({mensaje: 'Transacción anulada (no eliminada físicamente)',transaccion
    });
  } catch (error) {
    console.error('Error al anular/eliminar transacción:', error);
    res.status(500).json({mensaje: 'Error al anular transacción',error: error.message
    });
  }
};

const obtenerPorTipo = async (req, res) => {
  try {
    const { tipo } = req.params;
    const { desde, hasta } = req.query;

    const filtro = { Tipo: tipo };

    if (desde || hasta) {
      filtro.Fecha = {};
      if (desde) filtro.Fecha.$gte = new Date(desde);
      if (hasta) filtro.Fecha.$lte = new Date(hasta + 'T23:59:59');
    }

    const lista = await Transaccion.find(filtro).sort({ Fecha: -1 });
    res.json(lista);
  } catch (error) {
    console.error('Error en obtenerPorTipo:', error);
    res.status(500).json({ mensaje: 'Error al obtener por tipo', error: error.message });
  }
};

const obtenerPorMetodoPago = async (req, res) => {
  try {
    const { metodo } = req.params;
    const { desde, hasta } = req.query;

    const filtro = { MetodoPago: metodo };

    if (desde || hasta) {
      filtro.Fecha = {};
      if (desde) filtro.Fecha.$gte = new Date(desde);
      if (hasta) filtro.Fecha.$lte = new Date(hasta + 'T23:59:59');
    }

    const lista = await Transaccion.find(filtro).sort({ Fecha: -1 });
    res.json(lista);
  } catch (error) {
    console.error('Error en obtenerPorMetodoPago:', error);
    res.status(500).json({ mensaje: 'Error al obtener por método de pago', error: error.message });
  }
};

const obtenerPorSubtipo = async (req, res) => {
  try {
    const { subtipo } = req.params;
    const { desde, hasta } = req.query;

    const filtro = { Subtipo: subtipo };

    if (desde || hasta) {
      filtro.Fecha = {};
      if (desde) filtro.Fecha.$gte = new Date(desde);
      if (hasta) filtro.Fecha.$lte = new Date(hasta + 'T23:59:59');
    }

    const lista = await Transaccion.find(filtro).sort({ Fecha: -1 });
    res.json(lista);
  } catch (error) {
    console.error('Error en obtenerPorSubtipo:', error);
    res.status(500).json({ mensaje: 'Error al obtener por subtipo', error: error.message });
  }
};

const obtenerPorRangoFechas = async (req, res) => {
  try {
    const { inicio, fin } = req.params;

    if (!inicio || !fin) {
      return res.status(400).json({ mensaje: 'Debe enviar inicio y fin' });
    }

    const desde = new Date(inicio);
    const hasta = new Date(fin + 'T23:59:59');

    const lista = await Transaccion.find({
      Fecha: { $gte: desde, $lte: hasta }
    }).sort({ Fecha: -1 });

    res.json(lista);
  } catch (error) {
    console.error('Error en obtenerPorRangoFechas:', error);
    res.status(500).json({ mensaje: 'Error al obtener por rango de fechas', error: error.message });
  }
};

const obtenerTotales = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const match = {};

    if (desde || hasta) {
      match.Fecha = {};
      if (desde) match.Fecha.$gte = new Date(desde);
      if (hasta) match.Fecha.$lte = new Date(hasta + 'T23:59:59');
    }

    const agregados = await Transaccion.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$Tipo',
          totalMonto: { $sum: '$Monto' },
          cantidad: { $sum: 1 }
        }
      }
    ]);

    res.json(agregados);
  } catch (error) {
    console.error('Error en obtenerTotales:', error);
    res.status(500).json({ mensaje: 'Error al obtener totales', error: error.message });
  }
};

const totalesMensuales = async (req, res) => {
  try {
    const { año, mes } = req.params;
    const anioNum = parseInt(año, 10);
    const mesNum = parseInt(mes, 10);

    if (isNaN(anioNum) || isNaN(mesNum)) {
      return res.status(400).json({ mensaje: 'año y mes deben ser numéricos' });
    }

    const inicio = new Date(anioNum, mesNum - 1, 1);
    const fin = new Date(anioNum, mesNum, 0, 23, 59, 59);

    const agregados = await Transaccion.aggregate([
      {
        $match: {
          Fecha: { $gte: inicio, $lte: fin }
        }
      },
      {
        $group: {
          _id: '$Tipo',
          totalMonto: { $sum: '$Monto' },
          cantidad: { $sum: 1 }
        }
      }
    ]);

    res.json(agregados);
  } catch (error) {
    console.error('Error en totalesMensuales:', error);
    res.status(500).json({ mensaje: 'Error al obtener totales mensuales', error: error.message });
  }
};

const reportePorCategoria = async (req, res) => {
  try {
    const { categoria } = req.params;
    const { desde, hasta } = req.query;

    const match = { Categoria: categoria };

    if (desde || hasta) {
      match.Fecha = {};
      if (desde) match.Fecha.$gte = new Date(desde);
      if (hasta) match.Fecha.$lte = new Date(hasta + 'T23:59:59');
    }

    const agregados = await Transaccion.aggregate([
      { $match: match },
      {
        $group: {
          _id: { Tipo: '$Tipo', MetodoPago: '$MetodoPago' },
          totalMonto: { $sum: '$Monto' },
          cantidad: { $sum: 1 }
        }
      }
    ]);

    res.json(agregados);
  } catch (error) {
    console.error('Error en reportePorCategoria:', error);
    res.status(500).json({ mensaje: 'Error en reporte por categoría', error: error.message });
  }
};
module.exports = {
  crearTransaccion,
  obtenerTransacciones,
  obtenerTransaccionPorId,
  actualizarTransaccion,
  eliminarTransaccion, 
  obtenerPorTipo,
  obtenerPorMetodoPago,
  obtenerPorSubtipo,
  obtenerPorRangoFechas,
  obtenerTotales,
  totalesMensuales,
  reportePorCategoria

};

