const Movimiento = require('../models/MovimientoInventario');
const ProductoInsumo = require('../models/ProductoInsumo');
const Notificacion = require('../models/Notificacion');


exports.crearMovimiento = async (req, res) => {
    try {
        const { ProductoId, Tipo, Cantidad, Motivo, Tienda, UsuarioId, Nota, ReferenciaId } = req.body;
         
        if (!ProductoId || !Tipo || !Cantidad || !Motivo || !Tienda) {
            return res.status(400).json({ message: "Faltan datos obligatorios" });
        }

        const producto = await ProductoInsumo.findById(ProductoId);
        if (!producto) return res.status(404).json({ message: "Producto no encontrado" });

        let tiendaData = producto.Tiendas.find(t => t.Tienda === Tienda);
        if (!tiendaData) {
        let stockMinDefault = 0;
            try {
                stockMinDefault = await obtenerNumero('INV.STOCK_MINIMO_DEFAULT', Tienda, 0);
        } catch (e) {
            console.warn("No se pudo obtener STOCK_MINIMO_DEFAULT, usando 0");
        }
            tiendaData = {
                Tienda,
                Ubicacion: "Tienda",
                StockActual: 0,
                StockMinimo: stockMinDefault,
                StockMaximo: 0,
                Lotes: [],
                CostoPromedioTienda: 0
            };
            producto.Tiendas.push(tiendaData);
        }
        
        const cantidad = Number(Cantidad);
        
        if (Tipo === "Entrada") {
            tiendaData.StockActual += Cantidad;
        }else if (Tipo === "Salida") {

            if (tiendaData.StockActual < cantidad) {
                return res.status(400).json({ message: "Stock insuficiente en la tienda" });
            }
            tiendaData.StockActual -= cantidad;
            
        } else if (Tipo === "Ajuste") {
            tiendaData.StockActual = cantidad;

        } else if (Tipo === "Transferencia") {
      return res.status(400).json({ message: "Usa el endpoint /transferir para transferencias" });
    }

        producto.StockTotal = producto.Tiendas.reduce((acc, t) => acc + (t.StockActual || 0), 0);

        await producto.save();

        const movimiento = await Movimiento.create({
            ProductoId,
            Tipo,
            Cantidad: cantidad,
            Motivo,
            ReferenciaId: ReferenciaId || null,
            Tienda,
            UsuarioId: UsuarioId || null,
            Nota: Nota || ""
        });

        try {
            if (tiendaData.StockMinimo && tiendaData.StockActual <= tiendaData.StockMinimo) {
                await Notificacion.create({
                UsuarioId: null,
                Titulo: 'Stock bajo en inventario',
                Mensaje: `El producto "${producto.Nombre}" en ${Tienda} tiene stock ${tiendaData.StockActual} (mínimo: ${tiendaData.StockMinimo}).`,
                Tipo: 'Inventario',
                Nivel: 'warning',
                ReferenciaId: producto._id,
                ModeloRelacionado: 'ProductoInsumo',
                Tienda
            });
        }
        } catch (e) {
            console.error('No se pudo crear notificación de stock bajo:', e.message);
        }

        res.status(201).json({ message: "Movimiento registrado", movimiento });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al registrar movimiento", error: error.message });
    }
};

exports.transferir = async (req, res) => {
    try {
        const { ProductoId, Cantidad, TiendaOrigen, TiendaDestino, UsuarioId, Nota } = req.body;

        const producto = await ProductoInsumo.findById(ProductoId);
        if (!producto) return res.status(404).json({ message: "Producto no encontrado" });

        const cantidad = Number(Cantidad);
        
    let origen = producto.Tiendas.find(t => t.Tienda === TiendaOrigen);
    let destino = producto.Tiendas.find(t => t.Tienda === TiendaDestino);

    if (!origen) {
      return res.status(400).json({ message: "Tienda de origen no válida" });
    }

    if (!destino) {
      destino = {
        Tienda: TiendaDestino,
        Ubicacion: "Tienda",
        StockActual: 0,
        StockMinimo: 0,
        StockMaximo: 0,
        Lotes: [],
        CostoPromedioTienda: 0
      };
      producto.Tiendas.push(destino);
    }
    origen.StockActual -= cantidad;
    destino.StockActual += cantidad;

    producto.StockTotal = producto.Tiendas.reduce(
      (a, t) => a + (t.StockActual || 0),
      0
    );
        await producto.save();

        await Movimiento.create({
            ProductoId,
            Tipo: "Transferencia",
            Cantidad,
            Motivo: "Transferencia entre tiendas",
            Tienda: TiendaOrigen,
            UsuarioId,
            Nota: Nota || ""
        });

        res.json({ message: "Transferencia realizada correctamente" });

    } catch (error) {
        res.status(500).json({ message: "Error en transferencia", error: error.message });
    }
};

exports.obtenerMovimientos = async (req, res) => {
    try {
        const { tienda, tipo } = req.query;

        const filtro = {};

        if (tienda) filtro.Tienda = tienda;
        if (tipo) filtro.Tipo = tipo;
        const movimientos = await Movimiento.find()
            .populate("ProductoId", "Nombre Categoria Subcategoria")
            .populate("UsuarioId", "Usuario NombreCompleto Rol")
            .sort({ Fecha: -1 });

        res.json(movimientos);

    } catch (error) {
        res.status(500).json({ message: "Error al obtener movimientos", error: error.message });
    }
};

exports.obtenerMovimientoPorId = async (req, res) => {
    try {
        const movimiento = await Movimiento.findById(req.params.id)
            .populate('ProductoId')
            .populate('UsuarioId');

        if (!movimiento)
            return res.status(404).json({ message: "Movimiento no encontrado" });

        res.json(movimiento);

    } catch (error) {
        res.status(500).json({ message: "Error al obtener movimiento", error: error.message });
    }
};

exports.obtenerPorProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const movimientos = await Movimiento.find({ ProductoId: id })
            .populate('ProductoId', 'Nombre Categoria Subcategoria')
            .populate('UsuarioId', 'Usuario NombreCompleto Rol')
            .sort({ Fecha: -1 });

        res.json(movimientos);

    } catch (error) {
        res.status(500).json({ message: "Error al obtener movimientos del producto", error: error.message });
    }
};
exports.obtenerMovimientosPorRango = async (req, res) => {
    try {
        const { inicio, fin } = req.query;
        if (!inicio || !fin) {
            return res.status(400).json({ message: "Debe enviar 'inicio' y 'fin' en query" });
        }

        const movimientos = await Movimiento.find({
            Fecha: {
                $gte: new Date(inicio),
                $lte: new Date(fin + "T23:59:59")
            }
        })
            .populate('ProductoId', 'Nombre Categoria Subcategoria')
            .populate('UsuarioId', 'Usuario NombreCompleto Rol')
            .sort({ Fecha: -1 });

        res.json(movimientos);

    } catch (error) {
        res.status(500).json({ message: "Error al buscar por rango", error: error.message });
    }
};



