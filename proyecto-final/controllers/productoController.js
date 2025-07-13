const Producto = require('../models/ProductoInsumo');

exports.obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener productos', error });
  }
};

exports.agregarProducto = async (req, res) => {
  try {
    const { nombre, categoria } = req.body;

        const existente = await Producto.findOne({ nombre, categoria });

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
    const productos = await Producto.find({
      $or: [
        { nombre: { $regex: texto, $options: 'i' } },
        { categoria: { $regex: texto, $options: 'i' } }
      ]
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar productos', error });
  }
};

exports.movimientoProducto = async (req, res) => {
   try {
    const { tipo, cantidad, sede, usuario, motivo } = req.body;

    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    if (tipo === 'Entrada') {
      if (sede === 'SedeA') producto.stockSedeA += cantidad;
      else if (sede === 'SedeB') producto.stockSedeB += cantidad;
    } else if (tipo === 'Salida') {
      if (sede === 'SedeA') producto.stockSedeA -= cantidad;
      else if (sede === 'SedeB') producto.stockSedeB -= cantidad;
    }

    producto.movimientos.push({
      tipo, cantidad, sede, usuario, motivo, fecha: new Date()
    });

    await producto.save();
    res.json({ mensaje: 'Movimiento registrado', producto });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error en movimiento de stock', err });
  }
};
