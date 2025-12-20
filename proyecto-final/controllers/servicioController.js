const Servicio = require('../models/Servicios');

exports.crearServicio = async (req, res) => {
  try {
    const { Nombre, Categoria, Precio, Tienda, Descripcion } = req.body;

    if (!Nombre || !Categoria || Precio === undefined) {
      return res.status(400).json({ msg: 'Nombre, Categoria y Precio son obligatorios' });
    }

    const servicio = new Servicio({
      Nombre: Nombre.trim(),
      Categoria,
      Precio,
      Tienda: Tienda ,
      Descripcion
    });

    await servicio.save();

    res.status(201).json({
      msg: 'Servicio creado correctamente',
      servicio
    });
  } catch (error) {
    console.error('Error al crear servicio:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        msg: 'Ya existe un servicio con ese nombre, categoría y tienda'
      });
    }

    res.status(500).json({ msg: 'Error al crear servicio', error: error.message });
  }
};

exports.obtenerServicios = async (req, res) => {
  try {
    const { activo, categoria, tienda, texto } = req.query;
    const filtroBase = {};
    const andConditions = [];

    if (activo !== undefined) {
      filtroBase.Activo = activo === 'true';
    }

    if (categoria) {
      filtroBase.Categoria = categoria;
    }

    if (tienda) {
      andConditions.push({
        $or : [
        { Tienda: tienda },
        { Tienda: 'Ambas' }
      ]
    });
    }

    if (texto) {
      const regex = new RegExp(texto, 'i');
      andConditions.push({
        $or : [
        { Nombre: regex },
        { Descripcion: regex }
      ]
    });
    }

    const filtroFinal = andConditions.length
      ? { ...filtroBase, $and: andConditions }
      : filtroBase;

    const servicios = await Servicio.find(filtroFinal)
      .sort({ Nombre: 1 });

    res.json(servicios);
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({ msg: 'Error al obtener servicios', error: error.message });
  }
};

exports.obtenerServicioPorId = async (req, res) => {
  try {
    const servicio = await Servicio.findById(req.params.id);

    if (!servicio) {
      return res.status(404).json({ msg: 'Servicio no encontrado' });
    }

    res.json(servicio);
  } catch (error) {
    console.error('Error al obtener servicio:', error);
    res.status(500).json({ msg: 'Error al obtener servicio', error: error.message });
  }
};

exports.buscarServicio = async (req, res) => {
  try {
    const { texto } = req.params;

    const regex = new RegExp(texto, 'i');

    const servicios = await Servicio.find({
      $or: [
        { Nombre: regex },
        { Descripcion: regex }
      ]
    }).sort({ Nombre: 1 });

    res.json(servicios);
  } catch (error) {
    console.error('Error al buscar servicios:', error);
    res.status(500).json({ msg: 'Error al buscar servicios', error: error.message });
  }
};

exports.actualizarServicio = async (req, res) => {
  try {
    const camposPermitidos = ['Nombre', 'Descripcion', 'Precio', 'Categoria', 'Tienda', 'Activo'];
    const updateData = {};

    for (const campo of camposPermitidos) {
      if (req.body[campo] !== undefined) {
        updateData[campo] = req.body[campo];
      }
    }

    const servicio = await Servicio.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!servicio) {
      return res.status(404).json({ msg: 'Servicio no encontrado' });
    }

    res.json({
      msg: 'Servicio actualizado correctamente',
      servicio
    });
  } catch (error) {
    console.error('Error al actualizar servicio:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        msg: 'Ya existe un servicio con ese nombre, categoría y tienda'
      });
    }

    res.status(500).json({ msg: 'Error al actualizar servicio', error: error.message });
  }
};

exports.activarServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findByIdAndUpdate(
      req.params.id,
      { Activo: true },
      { new: true }
    );

    if (!servicio) {
      return res.status(404).json({ msg: 'Servicio no encontrado' });
    }

    res.json({ msg: 'Servicio activado', servicio });
  } catch (error) {
    console.error('Error al activar servicio:', error);
    res.status(500).json({ msg: 'Error al activar servicio', error: error.message });
  }
};

exports.desactivarServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findByIdAndUpdate(
      req.params.id,
      { Activo: false },
      { new: true }
    );

    if (!servicio) {
      return res.status(404).json({ msg: 'Servicio no encontrado' });
    }

    res.json({ msg: 'Servicio desactivado', servicio });
  } catch (error) {
    console.error('Error al desactivar servicio:', error);
    res.status(500).json({ msg: 'Error al desactivar servicio', error: error.message });
  }
};

exports.eliminarServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findByIdAndDelete(req.params.id);

    if (!servicio) {
      return res.status(404).json({ msg: 'Servicio no encontrado' });
    }

    res.json({ msg: 'Servicio eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    res.status(500).json({ msg: 'Error al eliminar servicio', error: error.message });
  }
};

