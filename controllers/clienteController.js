const Cliente = require('../models/Cliente');

// Buscar cliente por nombre o DNI
exports.buscarCliente = async (req, res) => {
    const texto = req.params.texto;
    try {
        const resultado = await Cliente.find({
            $or: [
                { nombre: { $regex: texto, $options: 'i' } },
                { dni: { $regex: texto, $options: 'i' } }
            ]
        });

        const cliente = resultado[0];

        if (!cliente) {
            return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }

        res.json(cliente);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar cliente' });
    }
};

// Insertar nuevo cliente
exports.agregarCliente = async (req, res) => {
    try {
        const { dni } = req.body;

        // Verificar si ya existe cliente con el mismo DNI
        const existente = await Cliente.findOne({ dni });

        if (existente) {
            return res.status(409).json({ error: 'El cliente ya está registrado con ese DNI.' });
        }
        const cliente = new Cliente(req.body);
        await cliente.save();
        res.status(201).json(cliente);
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar el cliente' });
    }
};
