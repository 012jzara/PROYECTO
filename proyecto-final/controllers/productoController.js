const Producto = require('../models/ProductoInsumo');

exports.obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find().sort({ Nombre: 1 });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener productos', error: error.message });
  }
};

exports.agregarProducto = async (req, res) => {
  try {
    const { Nombre, Categoria, Subcategoria, PrecioVenta } = req.body;

    if (!Nombre || !Categoria || !Subcategoria || PrecioVenta == null) {
      return res.status(400).json({ mensaje: 'Nombre, Categoria, Subcategoria y PrecioVenta son obligatorios.' });
    }
    const existente = await Producto.findOne({ Nombre, Categoria });
      if (existente) {
            return res.status(409).json({ error: 'Ya existe un producto o insumo con ese nombre y categoría.' });
      }
    const nuevo = new Producto(req.body);
    await nuevo.save();
    res.status(201).json({ mensaje: 'Producto guardado con éxito' });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al guardar producto', error });
  }
};

exports.actualizarProducto = async (req, res) => {
  try {
    const actualizado = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!actualizado) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto actualizado', actualizado });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar producto', error });
  }
};

exports.eliminarProducto = async (req, res) => {
  try {
    const eliminado = await Producto.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar producto', error });
  }
};

exports.buscarProducto = async (req, res) => {
  const texto = req.params.filtro;
  try {
    const regex = new RegExp(texto, 'i');
    const productos = await Producto.find({
      $or: [
        { Nombre: { $regex: regex } },
        { Categoria: { $regex: regex } }
      ]
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar productos', error });
  }

};
exports.obtenerProductoPorId = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(400).json({ mensaje: 'ID inválido', error: error.message });
  }
};

exports.filtrarPorCategoria = async (req, res) => {
  try {
    const { categoria } = req.params;
    const productos = await Producto.find({ Categoria: categoria }).sort({ Nombre: 1 });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al filtrar por categoría', error: error.message });
  }
};

exports.filtrarPorTienda = async (req, res) => {
  try {
    const { tienda } = req.params;
    const productos = await Producto.find({ Tienda: tienda }).sort({ Nombre: 1 });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al filtrar por tienda', error: error.message });
  }
};

exports.obtenerStockCritico = async (req, res) => {
  try {
    const umbral = Number(req.query.umbral ?? 5);

    // Intenta cubrir ambos nombres de campo comunes (Stock / Cantidad)
    const productos = await Producto.find({
      $or: [
        { Stock: { $lte: umbral } },
        { Cantidad: { $lte: umbral } }
      ]
    }).sort({ Nombre: 1 });

    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener stock crítico', error: error.message });
  }
};

exports.movimientoProducto = async (req, res) => {
  try {
    const { tipo, cantidad } = req.body; // tipo: "entrada" | "salida"
    const cant = Number(cantidad);

    if (!['entrada', 'salida'].includes(tipo)) {
      return res.status(400).json({ mensaje: 'Tipo inválido (usa "entrada" o "salida")' });
    }
    if (!cant || cant <= 0) {
      return res.status(400).json({ mensaje: 'Cantidad inválida' });
    }

    const prod = await Producto.findById(req.params.id);
    if (!prod) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    // Detecta campo de stock
    const campoStock = (prod.Stock !== undefined) ? 'Stock'
                     : (prod.Cantidad !== undefined) ? 'Cantidad'
                     : null;

    if (!campoStock) {
      return res.status(400).json({ mensaje: 'Tu modelo no tiene campo Stock ni Cantidad' });
    }

    const actual = Number(prod[campoStock] ?? 0);
    const nuevo = tipo === 'entrada' ? actual + cant : actual - cant;

    if (nuevo < 0) return res.status(400).json({ mensaje: 'Stock insuficiente' });

    prod[campoStock] = nuevo;
    await prod.save();

    res.json({ mensaje: 'Movimiento aplicado', producto: prod });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar movimiento', error: error.message });
  }
};
