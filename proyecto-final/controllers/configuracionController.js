const Config = require('../models/Configuracion');

function validarTipo(valor, tipo) {
    switch (tipo) {case "number":return typeof valor === "number";

        case "boolean": return typeof valor === "boolean";

        case "json": try {JSON.stringify(valor);return true;
            } catch {return false;}

        case "string":default:return typeof valor === "string";
    }
}

exports.crearConfig = async (req, res) => {
    try {
        const { Clave, Valor, Tipo = "string", Descripcion, Tienda = "GLOBAL" } = req.body;

        if (!Clave) return res.status(400).json({ msg: "La clave es obligatoria." });

        if (!validarTipo(Valor, Tipo))
            return res.status(400).json({ msg: `El valor no coincide con el tipo ${Tipo}.` });

        const claveUpper = Clave.toUpperCase();
        const existe = await Config.findOne({ Clave: Clave.toUpperCase() });

        if (existe)
            return res.status(400).json({ msg: "Ya existe una configuración con esa clave." });

        const config = await Config.create({Clave: claveUpper ,Valor,Tipo, Descripcion,Tienda});
        res.status(201).json({ msg: "Configuración creada correctamente.", config });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al crear configuración." });
    }
};


exports.obtenerConfigs = async (req, res) => {
    try {
        const { tienda, incluirInactivas } = req.query;
        const filtros = {};
            if (incluirInactivas !== 'true') {
            filtros.Activo = true;}
        if (tienda) {
        filtros.Tienda = { $in: [tienda, 'GLOBAL'] }; }
        const configs = await Config.find(filtros).sort({ Clave: 1, Tienda: 1 });
        res.json(configs);

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Error al obtener configuraciones." });
    }
};

exports.obtenerConfigPorClave = async (req, res) => {
    try {
        const { clave } = req.params;
        const { tienda } = req.query;

        const claveUpper = clave.toUpperCase();

        let filtro = { Clave: claveUpper, Activo: true };

        if (tienda) {
        filtro.Tienda = { $in: [tienda, 'GLOBAL'] };
        }

        const config = await Config.findOne(filtro).sort({Tienda: -1});

        if (!config) return res.status(404).json({ msg: "Configuración no encontrada." });

        res.json(config);

    } catch (error) {
        res.status(500).json({ msg: "Error al obtener configuración." });
    }
};

exports.actualizarConfig = async (req, res) => {
    try {
        const { clave } = req.params;
        const { Valor, Tipo, Descripcion, Tienda, Activo } = req.body;

    const claveUpper = clave.toUpperCase();

        const config = await Config.findOne({ Clave: clave.toUpperCase() });

        if (!config) return res.status(404).json({ msg: "Configuración no encontrada." });

        if (Valor !== undefined || Tipo) {
            const tipoValidar = Tipo || config.Tipo;
            const valorValidar = Valor !== undefined ? Valor : config.Valor;
            if (!validarTipo(valorValidar, tipoValidar)) {
                return res.status(400).json({ msg: `El valor no coincide con el tipo ${tipoValidar}.` });
            }
        }

        if (Valor !== undefined) config.Valor = Valor;
        if (Tipo) config.Tipo = Tipo;
        if (Descripcion !== undefined) config.Descripcion = Descripcion;
        if (Tienda !== undefined) config.Tienda = Tienda;
        if (Activo !== undefined) config.Activo = Activo;

        await config.save();

        res.json({ msg: "Configuración actualizada correctamente.", config });

    } catch (error) {
        res.status(500).json({ msg: "Error al actualizar configuración." });
    }
};

exports.eliminarConfig = async (req, res) => {
    try {
        const { clave } = req.params;
        const claveUpper = clave.toUpperCase();

        const config = await Config.findOne({ Clave: claveUpper });

        if (!config) return res.status(404).json({ msg: "Configuración no encontrada." });

        config.Activo = false;
        await config.save();

        res.json({ msg: "Configuración desactivada.", config });

    } catch (error) {
        res.status(500).json({ msg: "Error al eliminar configuración." });
    }
};
