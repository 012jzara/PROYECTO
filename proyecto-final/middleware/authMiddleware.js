const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const Log = require("../models/LogAuditoria");

const authenticate = async (req, res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith("Bearer "))
            return res.status(401).json({ msg: "Token no provisto" });

        const token = header.split(' ')[1];
        if (!token) return res.status(401).json({ msg: "Token no provisto" });
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        const user = await Usuario.findById(payload.id);
        if (!user) return res.status(401).json({ msg: "Usuario no encontrado" });
    if (!user.Activo) return res.status(403).json({ msg: 'Cuenta desactivada' });

        req.user = { id: user._id, Usuario: user.Usuario, Rol: user.Rol };

        next();
    } catch (err) {
        return res.status(401).json({ msg: "Token inválido o expirado" });
    }
};

const permitirRoles = (rolesPermitidos = []) => {
    return (req, res, next) => {
        if (!req.user)
            return res.status(401).json({ msg: "No autenticado" });

        if (rolesPermitidos.length === 0) return next ();
        if (!rolesPermitidos.includes(req.user.Rol)){
            return res.status(403).json({ msg: "No tienes permisos para esta acción" });
        }

        next();
    };
};

const auditar = (accion) => {
    return async (req, res, next) => {
         const start = Date.now();

        res.on("finish", async () => {
            try {
                await Log.create({
                    UsuarioId: req.user?.id || null,
                    Accion: accion,
                    Detalle: JSON.stringify({
                        body: req.body,
                        params: req.params,
                        query: req.query,
                        status: res.statusCode,
                        durationMs: Date.now() - start
                    }),
                    IP: req.headers["x-forwarded-for"] || req.ip,
                    UserAgent: req.headers["user-agent"]
                });
            }catch (e) {
                console.error("Error registrando auditoria:", e);
            }
        });

        next();
    };
};

module.exports = {
    authenticate,
    permitirRoles,
    auditar 
};
