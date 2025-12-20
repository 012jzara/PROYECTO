const Compra = require('../models/Compra');
const ProductoInsumo = require('../models/ProductoInsumo');
const Proveedor = require('../models/Proveedor');
const Usuario = require('../models/Usuario');
const MovimientoInventario = require('../models/MovimientoInventario');
const Notificacion = require('../models/Notificacion');
const Transaccion = require('../models/Transaccion');

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
exports.crearCompra = async (req, res) => {
    try {
        const { ProveedorId, UsuarioId, Items, Documento, Estado = 'Pagado', Tienda, Moneda='PEN' } = req.body;
        if (!ProveedorId || !UsuarioId || !Tienda || !Items || !Array.isArray(Items) || Items.length === 0) {
            return res.status(400).json({  msg: 'ProveedorId, UsuarioId, Tienda e Items son obligatorios' });
        }

        const proveedor = await Proveedor.findOne({_id: ProveedorId, Activo: true});
        if (!proveedor) return res.status(404).json({ msg: 'Proveedor no encontrado o inactivo' });
       
        const usuario = await Usuario.findById(UsuarioId);
        if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });
        if (!usuario.Activo) {
          return res.status(403).json({ msg: 'Usuario desactivado, no puede registrar compras' });
        }

        const itemsProcesados = Items.map(i => {
      const cant = Number(i.Cantidad);
      const precio = Number(i.PrecioCompra);
      return{
            ProductoId: i.ProductoId,
            Cantidad: Number(i.Cantidad),
            PrecioCompra: Number(i.PrecioCompra),
            Subtotal: Number(i.Cantidad) * Number(i.PrecioCompra),
            NumeroLote: i.NumeroLote || null,
            FechaCaducidad: i.FechaCaducidad || null
        };});
        const Total = itemsProcesados.reduce((acc, i) => acc + i.Subtotal, 0);
        
        const compra = new Compra({ 
          ProveedorId, 
          UsuarioId, 
          Tienda,
          Items:itemsProcesados.map(({NumeroLote, FechaCaducidad, ...rest })=>rest), 
          Total, 
          Documento, 
          Estado: Estado });
        await compra.save();

        for (const item of itemsProcesados) {
            const producto = await ProductoInsumo.findById(item.ProductoId);
            if (!producto) continue;

            let tiendaData = producto.Tiendas.find(t => t.Tienda === Tienda);
            if (!tiendaData) {
                tiendaData = {Tienda, Ubicacion: "Tienda", StockActual: 0, StockMinimo: 0, StockMaximo: 0, Lotes: [], CostoPromedioTienda: 0};
                producto.Tiendas.push(tiendaData);
            }

            const nuevoLote = {
                NumeroLote: item.NumeroLote,
                FechaCaducidad: item.FechaCaducidad || null,
                Stock: item.Cantidad,
                PrecioCompra: item.PrecioCompra,
                FechaIngreso: new Date()
            };
            tiendaData.Lotes.push(nuevoLote);

            tiendaData.StockActual += item.Cantidad;

            const totalStockTienda = tiendaData.Lotes.reduce((acc, l) => acc + l.Stock, 0);
            const totalCostoTienda = tiendaData.Lotes.reduce((acc, l) => acc + (l.Stock * l.PrecioCompra), 0);

            tiendaData.CostoPromedioTienda = totalCostoTienda> 0 ? totalCostoTienda  / totalStockTienda: 0;

            producto.StockTotal = producto.Tiendas.reduce((acc, t) => acc + t.StockActual, 0);

            const totalCostoGlobal = producto.Tiendas.reduce((acc, t) =>
                acc + (t.Lotes||[]).reduce((x, l) => x + (l.Stock * l.PrecioCompra), 0)
            , 0);

            producto.CostoPromedioGlobal = totalCostoGlobal / (producto.StockTotal || 1);
            producto.ValorTotalInventario = producto.StockTotal * producto.CostoPromedioGlobal;

            await producto.save();

            await MovimientoInventario.create({
                ProductoId: item.ProductoId,
                Tipo: "Entrada",
                Cantidad: item.Cantidad,
                Motivo: "Compra",
                Tienda,
                UsuarioId,
                Nota:  `Compra registrada${Documento ? ` (${Documento})` : ''}`,
                ReferenciaId: compra._id,
            });
        }

      const transaccion = await Transaccion.create({
      Tipo: 'Egreso',
      Subtipo: 'Compra',
      Categoria: 'Compra',
      Monto: Total,
      Moneda,
      MetodoPago: Estado === 'Pagado' ? 'Pagado' : 'Pendiente',
      Fecha: compra.Fecha,
      IdRelacionado: compra._id,
      ModeloRelacionado: 'Compra',
      Usuario: UsuarioId
    });

    try {
     await Notificacion.create({
     UsuarioId: UsuarioId,
     Titulo: 'Nueva compra registrada',
     Mensaje: `Compra por S/ ${Total.toFixed(2)} al proveedor ${proveedor.Nombre || proveedor._id}`,
     Tipo: 'Finanzas',
     Nivel: 'info',
     ReferenciaId: compra._id,
     ModeloRelacionado: 'Compra'
    });

  } catch (e) {
    console.error('No se pudo crear notificación de compra:', e.message);
  }
  res.status(201).json({ mensaje: "Compra registrada correctamente.", compra, transaccion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear compra." });
  }
};

exports.obtenerCompras = async (req, res) => {
  try {
    const { proveedorId, usuarioId, estado, desde, hasta } = req.query;
    const filtro = {};

    if (proveedorId) filtro.ProveedorId = proveedorId;
    if (usuarioId) filtro.UsuarioId = usuarioId;
    if (estado) filtro.Estado = estado;

    if (desde || hasta) {
      filtro.Fecha = {};
      if (desde) filtro.Fecha.$gte = new Date(desde);
      if (hasta) filtro.Fecha.$lte = new Date(hasta + 'T23:59:59');
    }

    const compras = await Compra.find(filtro)
      .populate('ProveedorId','Nombre RUC')
      .populate('UsuarioId', 'Usuario NombreCompleto Rol')
      .sort({ Fecha: -1 });

    res.json(compras);
  } catch (error) {
    console.error('Error al obtener compras:', error);
    res.status(500).json({ msg: "Error al obtener compras" , error: error.message});
  }
};

exports.obtenerComprasPorRango = async (req, res) => {
  try {
    const { inicio, fin } = req.query;

    const compras = await Compra.find({
      Fecha: {
        $gte: new Date(inicio),
        $lte: new Date(fin)
      }
    });

    res.json(compras);

  } catch (error) {
    res.status(500).json({ msg: "Error al obtener compras por rango" });
  }
};

exports.obtenerCompraPorId = async (req, res) => {
  try {
    const compra = await Compra.findById(req.params.id)
      .populate('ProveedorId', 'Nombre RUC')
      .populate('UsuarioId', 'Usuario NombreCompleto Rol')
      .populate('Items.ProductoId', 'Nombre Categoria Subcategoria');

    if (!compra) return res.status(404).json({ msg: "Compra no encontrada" });

    res.json(compra);

  } catch (error) {
    console.error('Error al obtener compra:', error);
    res.status(500).json({ msg: "Error al obtener compra" , error: error.message });
  }
};

exports.anularCompra = async (req, res) => {
  try {
    const { id } = req.params;

        const compra = await Compra.findById(req.params.id);
        if (!compra) {
            return res.status(404).json({ message: "Compra no encontrada." });
        }

        if (compra.Estado === "Anulado") {
            return res.status(400).json({ msg: "La compra ya fue anulada." });
        }

        const Tienda = compra.Tienda;
        if (!Tienda) {
            return res.status(400).json({ msg: "La compra no tiene tienda registrada." });
        }

        for (const item of compra.Items) {
            const producto = await ProductoInsumo.findById(item.ProductoId);
            if (!producto) continue;

            const tiendaData = producto.Tiendas.find(t => t.Tienda === Tienda);
            if (!tiendaData) 
                return res.status(400).json({ msg: `El producto ${producto.Nombre} no tiene stock registrado en esa tienda.` });

            if (tiendaData.StockActual < item.Cantidad) {
                return res.status(400).json({
                    msg: `No se puede anular la compra porque parte del stock producto "${producto.Nombre}" ya fue consumido.` 
                });
            }
            let cantidadPendiente = item.Cantidad;

            for (const lote of tiendaData.Lotes) {
                if (cantidadPendiente <= 0) break;

                const revertir = Math.min(lote.Stock, cantidadPendiente);
                lote.Stock -= revertir;
                cantidadPendiente -= revertir;
            }

            tiendaData.Lotes = tiendaData.Lotes.filter(l => l.Stock > 0);
            
            tiendaData.StockActual -= item.Cantidad;
            const stockTienda = tiendaData.Lotes.reduce((sum, l) => sum + l.Stock, 0);
            const costoTienda = tiendaData.Lotes.reduce((sum, l) => sum + l.Stock * l.PrecioCompra, 0);

            tiendaData.CostoPromedioTienda = 
            stockTienda > 0 ? (costoTienda / stockTienda) : 0;
            
             producto.StockTotal = producto.Tiendas.reduce((acc, t) => acc + t.StockActual, 0);

            const costoGlobal = producto.Tiendas.reduce((acc, t) =>
                acc + t.Lotes.reduce((x, l) => x + (l.Stock * l.PrecioCompra), 0)
            , 0);

            producto.CostoPromedioGlobal = 
            producto.StockTotal > 0 ? costoGlobal / producto.StockTotal : 0;

            producto.ValorTotalInventario = producto.CostoPromedioGlobal * producto.StockTotal;

            await producto.save();

            await MovimientoInventario.create({
                ProductoId: item.ProductoId,
                Tipo: "Salida",
                Cantidad: item.Cantidad,
                Origen: tiendaData.Tienda,
                Destino:"Anulacion de compra",
                UsuarioId: compra.UsuarioId,
                Nota: "Anulacion de compra",                
                ReferenciaId: compra._id
            });
        }


        compra.Estado = "Anulado";
        await compra.save();

        res.json({ message: "Compra anulada correctamente.", compra });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al anular compra." });
    }
};

exports.resumenComprasPorProveedor = async (req, res) => {
  try {
    const { desde, hasta, soloActivos = 'false' } = req.query;

    const match = {};
    if (desde || hasta) {
      match.Fecha = {};
      if (desde) match.Fecha.$gte = new Date(desde);
      if (hasta) match.Fecha.$lte = new Date(hasta + 'T23:59:59');
    }

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: '$ProveedorId',
          totalCompras: { $sum: 1 },
          totalMonto: { $sum: '$Total' }
        }
      },
      {
        $lookup: {
          from: 'proveedors',       
          localField: '_id',
          foreignField: '_id',
          as: 'proveedor'
        }
      },
      { $unwind: '$proveedor' }
    ];

    if (soloActivos === 'true') {
      pipeline.push({ $match: { 'proveedor.Activo': true } });
    }

    pipeline.push({
      $project: {
        _id: 0,
        ProveedorId: '$proveedor._id',
        Nombre: '$proveedor.Nombre',
        RUC: '$proveedor.RUC',
        Activo: '$proveedor.Activo',
        totalCompras: 1,
        totalMonto: 1
      }
    });

    pipeline.push({ $sort: { totalMonto: -1 } });

    const resumen = await Compra.aggregate(pipeline);
    res.json(resumen);

  } catch (error) {
    console.error('Error en resumen por proveedor:', error);
    res.status(500).json({ msg: 'Error al obtener resumen por proveedor', error: error.message });
  }
};

exports.resumenComprasPorPeriodo = async (req, res) => {
  try {
    const { desde, hasta, grupo = 'mes' } = req.query;

    const match = {};
    if (desde || hasta) {
      match.Fecha = {};
      if (desde) match.Fecha.$gte = new Date(desde);
      if (hasta) match.Fecha.$lte = new Date(hasta + 'T23:59:59');
    }

    let groupId;
    if (grupo === 'dia') {
      groupId = {
        año: { $year: '$Fecha' },
        mes: { $month: '$Fecha' },
        dia: { $dayOfMonth: '$Fecha' }
      };
    } else if (grupo === 'año') {
      groupId = { año: { $year: '$Fecha' } };
    } else { 
      groupId = {
        año: { $year: '$Fecha' },
        mes: { $month: '$Fecha' }
      };
    }

    const resumen = await Compra.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupId,
          totalCompras: { $sum: 1 },
          totalMonto: { $sum: '$Total' }
        }
      },
      {
        $project: {
          _id: 0,
          periodo: '$_id',
          totalCompras: 1,
          totalMonto: 1
        }
      },
      { $sort: { 'periodo.año': 1, 'periodo.mes': 1, 'periodo.dia': 1 } }
    ]);

    res.json(resumen);

  } catch (error) {
    console.error('Error en resumen por periodo:', error);
    res.status(500).json({ msg: 'Error al obtener resumen por periodo', error: error.message });
  }
};
