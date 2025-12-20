const Propietario = require('../models/Propietario');

exports.obtenerPropietarios = async (req, res) => {
  try {
    const lista = await Propietario.find();
    res.json(lista);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener propietarios' });
  }
};

exports.obtenerPropietario = async (req, res) => {
  try {
    const propietario = await Propietario.findById(req.params.id);
    if (!propietario) return res.status(404).json({ mensaje: 'No encontrado' });
    res.json(propietario);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener propietario' });
  }
};

exports.crearPropietario = async (req, res) => {
  try {
    const nuevo = new Propietario(req.body);
    await nuevo.save();
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: 'Error al guardar propietario' });
  }
};

exports.actualizarPropietario = async (req, res) => {
  try {
    const actualizado = await Propietario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!actualizado) return res.status(404).json({ mensaje: 'No encontrado' });
    res.json(actualizado);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar propietario' });
  }
};

exports.eliminarPropietario = async (req, res) => {
  try {
    const eliminado = await Propietario.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ mensaje: 'No encontrado' });
    res.json({ mensaje: 'Propietario eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar propietario' });
  }
};