const Mascota = require('../models/Mascota');
const Cliente = require('../models/Cliente');
const mongoose = require('mongoose');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.crearMascota = async (req, res) => {
    try {
        const { Nombre, ClienteId } = req.body;

        if (!Nombre || !ClienteId) {
            return res.status(400).json({ msg: "Nombre y ClienteId son obligatorios." });
        }

        if (!isValidId(ClienteId)) {
            return res.status(400).json({ msg: "ClienteId inválido." });
        }

         const cliente = await Cliente.findById(ClienteId);
        if (!cliente) {
        return res.status(404).json({ msg: 'Cliente asociado no encontrado.' });
        }
        const nuevaMascota = new Mascota(req.body);
        await nuevaMascota.save();

        res.status(201).json({ msg: "Mascota registrada correctamente.", mascota: nuevaMascota });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al crear mascota." });
    }
};

exports.obtenerMascotas = async (req, res) => {
    try {
        const mascotas = await Mascota.find()
            .populate("ClienteId", "Nombre Dni Contacto1 Contacto2")
            .sort({ createdAt: -1 });

        res.json(mascotas);

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener mascotas." });
    }
};

exports.obtenerMascotaPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({ msg: "ID inválido." });
        }

        const mascota = await Mascota.findById(id)
            .populate("ClienteId", "Nombre Dni Contacto1 Contacto2");

        if (!mascota) return res.status(404).json({ msg: "Mascota no encontrada." });

        res.json(mascota);

    } catch (error) {
    console.error(error);
        res.status(500).json({ msg: "Error al obtener mascota." });
    }
};

exports.obtenerMascotasPorCliente = async (req, res) => {
    try {
        const { clienteId } = req.params;

        if (!isValidId(clienteId)) {
            return res.status(400).json({ msg: "ClienteId inválido." });
        }

        const mascotas = await Mascota.find({ ClienteId: clienteId })
            .populate("ClienteId", "Nombre Dni Contacto1 Contacto2");

        res.json(mascotas);

    } catch (error) {
    console.error(error);
        res.status(500).json({ msg: "Error al obtener mascotas del cliente." });
    }
};

exports.buscarMascota = async (req, res) => {
    try {
        const { texto } = req.params;

        const regex = new RegExp(texto, "i");

        const mascotas = await Mascota.find({
            $or: [
                { Nombre: { $regex: regex } },
                { Raza: { $regex: regex } },
                { Especie: { $regex: regex } },
            ]
        }).populate("ClienteId", "Nombre Dni");

        res.json(mascotas);

    } catch (error) {
    console.error(error);
        res.status(500).json({ msg: "Error al buscar mascotas." });
    }
};

exports.actualizarMascota = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({ msg: "ID inválido." });
        }

        const mascota = await Mascota.findByIdAndUpdate(id, req.body, { new: true });

        if (!mascota) return res.status(404).json({ msg: "Mascota no encontrada." });

        res.json({ msg: "Mascota actualizada correctamente.", mascota });

    } catch (error) {
    console.error(error);
        res.status(500).json({ msg: "Error al actualizar mascota." });
    }
};

exports.eliminarMascota = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidId(id)) {
            return res.status(400).json({ msg: "ID inválido." });
        }

        const mascota = await Mascota.findByIdAndDelete(id);

        if (!mascota) return res.status(404).json({ msg: "Mascota no encontrada." });

        res.json({ msg: "Mascota eliminada correctamente." });

    } catch (error) {
    console.error(error);
        res.status(500).json({ msg: "Error al eliminar mascota." });
    }
};
