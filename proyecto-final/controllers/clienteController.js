const Cliente = require('../models/Cliente');

exports.buscarCliente = async (req, res) => {
    try {
        const texto = (req.params.texto || '').trim();
        if (!texto) {
        return res.status(400).json({ mensaje: 'Texto de búsqueda requerido' });
        }
        const filtro = [];

        if (/^\d+$/.test(texto)) {
            filtro.push({Dni:texto});
        }
        filtro.push({Nombre:{$regex: texto, $options: 'i'}});

        const resultado = await Cliente.find({ $or: filtro});

        if (resultado.length === 0){
            return res.status(404).json({mensaje: 'Cliente no encontrado'})
        }

        res.json(resultado);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar cliente' });
    }
};

exports.agregarCliente = async (req, res) => {
    try {
        const { Dni } = req.body;
        if (Dni) {
            const existente = await Cliente.findOne({Dni});
            if(existente)
            return res.status(409).json({ error: 'El cliente ya está registrado con ese DNI.' });
        }
        const cliente = new Cliente(req.body);
        await cliente.save();
        res.status(201).json(cliente);
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar el cliente' });
    }
};

exports.obtenerCliente = async (req, res) => {
    try {
        const clientes = await Cliente.find().sort({ createdAt: -1 });
        res.json(clientes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
};

exports.obtenerClientePorId = async (req, res) => {
    try {
        const cliente = await Cliente.findById(req.params.id);

        if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });

        res.json(cliente);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al buscar cliente por ID' });
    }
};

exports.existeClientePorDni = async (req, res) => {
  try {
    const dni = (req.params.dni || '').trim();

    if (!dni) {
      return res.status(400).json({ msg: 'DNI requerido.' });
    }

    const cliente = await Cliente.findOne({ Dni: dni });

    return res.json({
      existe: !!cliente,
      cliente
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error al verificar cliente por DNI.' });
  }
};

exports.actualizarCliente = async (req, res) => {
    try {
    const { Dni } = req.body;

    if (Dni) {
      const existeDni = await Cliente.findOne({ Dni, _id: { $ne: req.params.id } });
      if (existeDni) {
        return res.status(409).json({ error: 'Otro cliente ya tiene ese DNI.' });
      }
    }
        const cliente = await Cliente.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });

        res.json(cliente);
    } catch (error) {
    console.error(error);
        res.status(500).json({ error: 'Error al actualizar cliente' });
    }
};

exports.eliminarCliente = async (req, res) => {
    try {
        const cliente = await Cliente.findByIdAndDelete(req.params.id);

        if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });

        res.json({ mensaje: 'Cliente eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar cliente' });
    }
};
