const Transaccion = require('../models/Transaccion');

const crearTransaccion = async (req, res) => {
  try {
    const transaccion = new Transaccion(req.body);
    await transaccion.save();
    res.status(201).json(transaccion);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al guardar transacci\u00f3n', error });
  }
};

const obtenerTransacciones = async (req, res) => {
  try {
    const lista = await Transaccion.find();
    res.json(lista);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener transacciones', error });
  }
};

const obtenerTransaccionPorId = async (req, res) => {
  try {
    const item = await Transaccion.findById(req.params.id);
    if (!item) return res.status(404).json({ mensaje: 'Transacci\u00f3n no encontrada' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar transacci\u00f3n', error });
  }
};

const actualizarTransaccion = async (req, res) => {
  try {
    const actualizada = await Transaccion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!actualizada) return res.status(404).json({ mensaje: 'Transacci\u00f3n no encontrada' });
    res.json(actualizada);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar transacci\u00f3n', error });
  }
};

const eliminarTransaccion = async (req, res) => {
  try {
    const eliminada = await Transaccion.findByIdAndDelete(req.params.id);
    if (!eliminada) return res.status(404).json({ mensaje: 'Transacci\u00f3n no encontrada' });
    res.json({ mensaje: 'Transacci\u00f3n eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar transacci\u00f3n', error });
  }
};

module.exports = {
  crearTransaccion,
  obtenerTransacciones,
  obtenerTransaccionPorId,
  actualizarTransaccion,
  eliminarTransaccion
};