const mongoose = require('mongoose');
const Venta = require('../models/Venta');
const ProductoInsumo = require('../models/ProductoInsumo');
const MovimientoInventario = require('../models/MovimientoInventario');
const Transaccion = require('../models/Transaccion');
const Cliente = require('../models/Cliente');
const Usuario = require('../models/Usuario');
const Pago = require('../models/Pago');
const Cita = require('../models/Cita');
const Notificacion = require('../models/Notificacion');
const { obtenerNumero, obtenerString } = require('../services/configService');


function recalcularCostosProducto(producto) {
  producto.StockTotal = producto.Tiendas.reduce(
    (acc, t) => acc + (t.StockActual || 0),
    0
  );

  const totalCostoGlobal = producto.Tiendas.reduce((acc, t) => {
    const costoTienda = (t.Lotes || []).reduce(
      (x, l) => x + (l.Stock * l.PrecioCompra),
      0
    );
    return acc + costoTienda;
  }, 0);

  producto.CostoPromedioGlobal = producto.StockTotal > 0
    ? totalCostoGlobal / producto.StockTotal
    : 0;

  producto.ValorTotalInventario = producto.StockTotal * producto.CostoPromedioGlobal;
}

exports.crearVenta = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  try {
    const {
      ClienteId,
      UsuarioId,
      Tienda,
      Items,
      MetodoPago,
      Moneda = 'PEN',
      Pagos,
      Descuento = 0,
      Documento,
      CitaId
    } = req.body;

    if (!UsuarioId || !Tienda ||!MetodoPago ||!Array.isArray(Items) || Items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ msg: 'Faltan datos obligatorios (UsuarioId, Tienda, MetodoPago, Items)' });
    }

    const usuario = await Usuario.findById(UsuarioId).session(session);
    if (!usuario) {await session.abortTransaction(); session.endSession(); 
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    if (!usuario.Activo)  {await session.abortTransaction();session.endSession();
      return res.status(403).json({msg: 'Cuenta de usuario desactivada'});
    }
    if (ClienteId) {
      const cliente = await Cliente.findById(ClienteId).session(session);
      if (!cliente) {await session.abortTransaction();session.endSession();
        return res.status(404).json({ msg: 'Cliente no encontrado' });
      }
    }

    const monedaDefault = await obtenerString('SISTEMA.MONEDA_DEFAULT', Tienda, 'PEN');
    const monedaFinal = Moneda || monedaDefault;

    const itemsProcesados = [];
    let subtotalGeneral = 0;

    for (const rawItem of Items) {
      const { ProductoId, Cantidad, PrecioUnitario } = rawItem;
      if (!ProductoId || !Cantidad || !PrecioUnitario) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ msg: 'Cada ítem debe tener ProductoId, Cantidad y PrecioUnitario' });
      }

      const cantidadNum = Number(Cantidad);
      const precioNum = Number(PrecioUnitario);

      const producto = await ProductoInsumo.findById(item.ProductoId).session(session);
      if (!producto) {await session.abortTransaction();session.endSession();
        return res.status(404).json({ msg: `Producto no encontrado (${ProductoId})` });
      }

      let tiendaData = producto.Tiendas.find(t => t.Tienda === Tienda);
      if (!tiendaData) {await session.abortTransaction();session.endSession();
        return res.status(400).json({ msg: `El producto ${producto.Nombre} no tiene stock en la tienda ${Tienda}` });
      }

      let cantidadPendiente = cantidadNum;
      const lotesUsados = [];

      const lotesOrdenados = [...(tiendaData.Lotes || [])].sort(
        (a, b) => new Date(a.FechaIngreso) - new Date(b.FechaIngreso)
      );

      for (const lote of lotesOrdenados) {
        if (cantidadPendiente <= 0) break;
        if (lote.Stock <= 0) continue;

        const usar = Math.min(lote.Stock, cantidadPendiente);
        lote.Stock -= usar;
        cantidadPendiente -= usar;

        lotesUsados.push({
          NumeroLote: lote.NumeroLote,
          CantidadExtraida: usar,
          PrecioCompra: lote.PrecioCompra
        });
      }

      if (cantidadPendiente > 0) {await session.abortTransaction();session.endSession();
        return res.status(400).json({
          msg: `Stock insuficiente para el producto ${producto.Nombre} en la tienda ${Tienda}`
        });
      }

      tiendaData.StockActual = (tiendaData.Lotes || []).reduce(
        (acc, l) => acc + (l.Stock || 0),
        0
      );

      const totalStockTienda = tiendaData.StockActual;
      const totalCostoTienda = (tiendaData.Lotes || []).reduce(
        (acc, l) => acc + (l.Stock * l.PrecioCompra),
        0
      );
      tiendaData.CostoPromedioTienda = totalStockTienda > 0
        ? totalCostoTienda / totalStockTienda
        : 0;

      recalcularCostosProducto(producto);
      await producto.save({ session});

      const subtotal = cantidadNum * precioNum;
      subtotalGeneral += subtotal;

      itemsProcesados.push({
        Tipo: 'Producto',
        ProductoId,
        ServicioId: null,
        Cantidad: cantidadNum,
        PrecioUnitario: precioNum,
        Subtotal: subtotal,
        LotesUsados: lotesUsados
      });
    }

    const descuentoNum = Number(Descuento) || 0;

    const maxDescPorc = await obtenerNumero('VENTA.DESCUENTO_MAXIMO_PORC', Tienda, 0); 
    if (maxDescPorc > 0) {
      const maxDescuentoValor = (maxDescPorc / 100) * subtotalGeneral;
      if (descuentoNum > maxDescuentoValor + 0.001) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          msg: `El descuento máximo permitido es de ${maxDescPorc}% (${maxDescuentoValor.toFixed(2)}).`,
          subtotal: subtotalGeneral,
          descuentoSolicitado: descuentoNum
        });
      }
    }

    let total = subtotalGeneral - descuentoNum;
    if (total < 0) total = 0;

    const venta = await Venta.create({
      ClienteId: ClienteId || null,
      UsuarioId,
      Tienda,
      CitaId: CitaId || null,
      Items: itemsProcesados,
      SubtotalGeneral: subtotalGeneral,
      Descuento: descuentoNum,
      Total: total,
      Moneda: monedaFinal,
      MetodoPago,
      Documento: Documento || {},
      Estado: 'Pendiente',
      Fecha: new Date()
    });
    await venta.save({session});

    for (const item of itemsProcesados) {
      const mov = new MovimientoInventario({
        ProductoId: item.ProductoId,
        Tipo: 'Salida',
        Cantidad: item.Cantidad,
        Motivo: 'Venta',
        ReferenciaId: venta._id,
        Tienda,
        UsuarioId,
        Nota: `Venta en tienda ${Tienda}`
      });
      await mov.save({session});
    }

    const Transaccion = new Transaccion({
      Tipo: 'Ingreso',
      Subtipo: 'Venta',
      Categoria: 'Venta',
      Monto: total,
      Moneda: monedaFinal,
      MetodoPago: 'Pendiente',
      Fecha: venta.Fecha,
      IdRelacionado: venta._id,
      ModeloRelacionado: 'Venta',
      Usuario: UsuarioId
    });
    await Transaccion.save({session});

     let totalPagado = 0;

        if (Array.isArray(Pagos) && Pagos.length > 0) {
            for (const p of Pagos) {
                const montoPago = Number(p.Monto || 0);
                if (montoPago <= 0) continue;

                totalPagado += montoPago;

                const pago = new Pago({
                    TransaccionId: transaccion._id,
                    Monto: montoPago,
                    Metodo: p.Metodo || MetodoPago,
                    UsuarioId: UsuarioId
                });
                await pago.save({session});
            }
        } else {
            if (MetodoPago !== 'Credito') {
                totalPagado = Total;
                await Pago.create({
                    TransaccionId: transaccion._id,
                    Monto: Total,
                    Metodo: MetodoPago,
                    UsuarioId: UsuarioId
                });
                await pago.save({session});
            }
        }

        let estadoPago = 'Pendiente';
        if (Math.abs(totalPagado - Total) < 0.001) {estadoPago = 'Pagado';
          } else if (totalPagado === 0){estadoPago = 'Pendiente';} else{ estadoPago = 'Pendiente'; }

        venta.Estado = estadoPago;await venta.save({ session });
        Transaccion.MetodoPago = estadoPago; await trans.save({ session });

        if (CitaId) {await Cita.findByIdAndUpdate(CitaId,
          { Estado: 'Finalizado', VentaId: ventaCreada._id },
          { new: true, session });
        }

        await session.commitTransaction();
        session.endSession();

      try {
        await Notificacion.create({
        UsuarioId: UsuarioId,
        Titulo: 'Nueva venta registrada',
        Mensaje: `Venta en tienda ${Tienda} por S/ ${Total.toFixed(2)}. Estado: ${estadoPago}.`,
        Tipo: 'Finanzas',
        Nivel: estadoPago === 'Pagado' ? 'success' : 'warning',
        ReferenciaId: ventaCreada._id,
        ModeloRelacionado: 'Venta',
        Tienda
      });
      } catch (e) {
        console.error('No se pudo crear notificación de venta:', e.message);
      }

      res.status(201).json({msg: 'Venta creada correctamente',venta,
        transaccion,
        totalPagado
      });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error al crear venta:',error);
    res.status(500).json({ msg: 'Error al crear venta', error: error.message });
  }
};

exports.obtenerVentas = async (req, res) => {
  try {
    const {desde, hasta, tienda, clienteId, usuarioId, estado } = req.query;
    const filtro = {};

    if (tienda) filtro.Tienda = tienda;
    if (clienteId) filtro.ClienteId = clienteId;
    if (usuarioId) filtro.UsuarioId = usuarioId;
    if (estado) filtro.Estado = estado;
    if (desde || hasta) {
        filtro.Fecha = {};
        if (desde) filtro.Fecha.$gte = new Date(desde);
        if (hasta) filtro.Fecha.$lte = new Date(hasta + 'T23:59:59');
    } 
    const ventas = await Venta.find(filtro)
      .populate('ClienteId', 'Nombre Dni')
      .populate('UsuarioId', 'Usuario NombreCompleto Rol')
      .sort({ Fecha: -1 });

    res.json(ventas);

  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener ventas', error: error.message });
  }
};

exports.obtenerVentaPorId = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
      .populate('ClienteId', 'Nombre Dni')
      .populate('UsuarioId', 'Usuario NombreCompleto Rol')
      .populate('Items.ProductoId', 'Nombre Categoria Subcategoria');

    if (!venta) return res.status(404).json({ msg: 'Venta no encontrada' });

    res.json(venta);
  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener venta', error: error.message });
  }
};

exports.obtenerVentasPorRango = async (req, res) => {
  try {
    const { inicio, fin } = req.query;
    if (!inicio || !fin) {
      return res.status(400).json({ msg: 'Debe enviar "inicio" y "fin"' });
    }

    const desde = new Date(inicio);
    const hasta = new Date(fin + 'T23:59:59');

    const ventas = await Venta.find({
      Fecha: { $gte: desde, $lte: hasta }
    })
      .populate('ClienteId', 'Nombre Dni')
      .populate('UsuarioId', 'Usuario NombreCompleto Rol')
      .sort({ Fecha: -1 });

    res.json(ventas);

  } catch (error) {
    res.status(500).json({ msg: 'Error al obtener ventas por rango', error: error.message });
  }
};

exports.anularVenta = async (req, res) => {
  try {
    const { id } = req.params;

    const venta = await Venta.findById(id);
    if (!venta) return res.status(404).json({ msg: 'Venta no encontrada' });

    if (venta.Estado === 'Anulado') {
      return res.status(400).json({ msg: 'La venta ya está anulada' });
    }

    const tienda = venta.Tienda;
    const usuarioId = venta.UsuarioId;

    for (const item of venta.Items) {
      const producto = await ProductoInsumo.findById(item.ProductoId);
      if (!producto) continue;

      let tiendaData = producto.Tiendas.find(t => t.Tienda === tienda);
      if (!tiendaData) {
        tiendaData = {
          Tienda: tienda,
          Ubicacion: 'Tienda',
          StockActual: 0,
          StockMinimo: 0,
          StockMaximo: 0,
          Lotes: [],
          CostoPromedioTienda: 0
        };
        producto.Tiendas.push(tiendaData);
      }

      for (const uso of item.LotesUsados || []) {
        let lote = (tiendaData.Lotes || []).find(l => l.NumeroLote === uso.NumeroLote);
        if (!lote) {
          lote = {
            NumeroLote: uso.NumeroLote,
            FechaCaducidad: null,
            Stock: 0,
            PrecioCompra: uso.PrecioCompra,
            FechaIngreso: new Date()
          };
          tiendaData.Lotes.push(lote);
        }

        lote.Stock += uso.CantidadExtraida;
      }

      tiendaData.StockActual = (tiendaData.Lotes || []).reduce(
        (acc, l) => acc + (l.Stock || 0),
        0
      );

      const totalStockTienda = tiendaData.StockActual;
      const totalCostoTienda = (tiendaData.Lotes || []).reduce(
        (acc, l) => acc + (l.Stock * l.PrecioCompra),
        0
      );
      tiendaData.CostoPromedioTienda = totalStockTienda > 0
        ? totalCostoTienda / totalStockTienda
        : 0;

      recalcularCostosProducto(producto);
      await producto.save();

      await MovimientoInventario.create({
        ProductoId: item.ProductoId,
        Tipo: 'Entrada',
        Cantidad: item.Cantidad,
        Motivo: 'Anulación de venta',
        ReferenciaId: venta._id,
        Tienda: tienda,
        UsuarioId: usuarioId,
        Nota: 'Reverso de venta'
      });
    }

    venta.Estado = 'Anulado';
    await venta.save();

    await Transaccion.updateMany(
      { ModeloRelacionado: 'Venta', IdRelacionado: venta._id },
      { MetodoPago: 'Anulado' }
    );

    res.json({ msg: 'Venta anulada correctamente', venta });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al anular venta', error: error.message });
  }
};
