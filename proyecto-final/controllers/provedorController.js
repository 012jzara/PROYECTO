const Proveedor = require('../models/Proveedor');

exports.crearProveedor = async (req, res) => {
  try {
    const { Nombre, RUC } = req.body;

    if (!Nombre) {
      return res.status(400).json({ msg: 'El Nombre es obligatorio' });
    }

    if (RUC) {
      const existente = await Proveedor.findOne({ RUC });
      if (existente) {
        return res.status(409).json({ msg: 'Ya existe un proveedor con ese RUC' });
      }
    }

    const proveedor = new Proveedor(req.body);
    await proveedor.save();

    res.status(201).json({ msg: 'Proveedor creado correctamente', proveedor });

  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({ msg: 'Error al crear proveedor', error: error.message });
  }
};

exports.obtenerProveedores = async (req, res) => {
  try {
    const { activo, texto } = req.query;
    const filtro = {};

    if (activo === 'true') filtro.Activo = true;
    if (activo === 'false') filtro.Activo = false;

    if (texto) {
      filtro.$or = [
        { Nombre: { $regex: texto, $options: 'i' } },
        { RUC: { $regex: texto, $options: 'i' } }
      ];
    }

    const proveedores = await Proveedor.find(filtro).sort({ Nombre: 1 });
    res.json(proveedores);

  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ msg: 'Error al obtener proveedores', error: error.message });
  }
};

exports.obtenerProveedorPorId = async (req, res) => {
  try {
    const proveedor = await Proveedor.findById(req.params.id);
    if (!proveedor) {
      return res.status(404).json({ msg: 'Proveedor no encontrado' });
    }
    res.json(proveedor);

  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    res.status(500).json({ msg: 'Error al obtener proveedor', error: error.message });
  }
};

exports.buscarProveedor = async (req, res) => {
  try {
    const { texto } = req.params;

    const proveedores = await Proveedor.find({
      $or: [
        { Nombre: { $regex: texto, $options: 'i' } },
        { RUC: { $regex: texto, $options: 'i' } }
      ]
    }).sort({ Nombre: 1 });

    res.json(proveedores);

  } catch (error) {
    console.error('Error al buscar proveedor:', error);
    res.status(500).json({ msg: 'Error al buscar proveedor', error: error.message });
  }
};

exports.actualizarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { RUC } = req.body;

    if (RUC) {
      const duplicado = await Proveedor.findOne({ RUC, _id: { $ne: id } });
      if (duplicado) {
        return res.status(409).json({ msg: 'Ya existe otro proveedor con ese RUC' });
      }
    }

    const proveedor = await Proveedor.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!proveedor) {
      return res.status(404).json({ msg: 'Proveedor no encontrado' });
    }

    res.json({ msg: 'Proveedor actualizado correctamente', proveedor });

  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(500).json({ msg: 'Error al actualizar proveedor', error: error.message });
  }
};

exports.activarProveedor = async (req, res) => {
  try {
    const proveedor = await Proveedor.findByIdAndUpdate(
      req.params.id,
      { Activo: true },
      { new: true }
    );

    if (!proveedor) {
      return res.status(404).json({ msg: 'Proveedor no encontrado' });
    }

    res.json({ msg: 'Proveedor activado', proveedor });

  } catch (error) {
    console.error('Error al activar proveedor:', error);
    res.status(500).json({ msg: 'Error al activar proveedor', error: error.message });
  }
};

exports.desactivarProveedor = async (req, res) => {
  try {
    const proveedor = await Proveedor.findByIdAndUpdate(
      req.params.id,
      { Activo: false },
      { new: true }
    );

    if (!proveedor) {
      return res.status(404).json({ msg: 'Proveedor no encontrado' });
    }

    res.json({ msg: 'Proveedor desactivado', proveedor });

  } catch (error) {
    console.error('Error al desactivar proveedor:', error);
    res.status(500).json({ msg: 'Error al desactivar proveedor', error: error.message });
  }
};

exports.eliminarProveedor = async (req, res) => {
  try {
    const eliminado = await Proveedor.findByIdAndDelete(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ msg: 'Proveedor no encontrado' });
    }

    res.json({ msg: 'Proveedor eliminado definitivamente' });

  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({ msg: 'Error al eliminar proveedor', error: error.message });
  }
};
