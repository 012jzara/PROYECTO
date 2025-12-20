const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');

exports.crearUsuario = async (req, res) => {
    try {
        const nuevo = new Usuario(req.body);
        await nuevo.save();

        res.status(201).json(nuevo);

        try {
            await Log.create({
                UsuarioId: req.user.id, 
                Accion: 'CREAR_USUARIO',
                Detalle: `Se creó el usuario ${nuevo.Usuario} (${nuevo._id}) con rol ${nuevo.Rol}`,
                IP: req.ip,
                UserAgent: req.headers['user-agent']
            });
        } catch (errLog) {
            console.error('Error registrando log crear usuario:', errLog.message);
        }

    } catch (error) {
        console.error('Error al crear usuario:', error.message);
        res.status(500).json({ msg: 'Error al crear usuario' });
    }
};

exports.registrarUsuario = async (req, res) => {
    try {
        const { Usuario: username, Contrasena, NombreCompleto, Email, Telefono, Especialidad, NumeroColegiado, Rol } = req.body;
        
    if (!username || !Contrasena) {
      return res.status(400).json({ msg: 'Usuario y contraseña son obligatorios' });
    }
        const existe = await Usuario.findOne({ Usuario: username });
        if (existe)
            return res.status(400).json({ msg: "El usuario ya existe" });

        if (Email) {
      const existeEmail = await Usuario.findOne({ Email });
      if (existeEmail) {
        return res.status(400).json({ msg: 'El email ya está registrado' });
      }
    }
        const nuevo = new Usuario({
            Usuario: username,
            Contrasena,
            NombreCompleto,
            Email,
            Telefono,
            Especialidad,
            NumeroColegiado,
            Rol
        });

        await nuevo.save();

        res.json({
            msg: "Usuario registrado correctamente",
            usuario: nuevo
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al registrar usuario", error });
    }
};

exports.obtenerPerfil = async (req, res) => {
    try {
    const user = await Usuario.findById(req.user.id).select("-Contrasena");
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ msg: "Error al obtener perfil", error });
    }
};

exports.obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find().select("-Contrasena");
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ msg: "Error al listar usuarios", error });
    }
};

exports.actualizarRol = async (req, res) => {
    try {
        const { Rol } = req.body;
        const { id } = req.params;
        const user = await Usuario.findByIdAndUpdate(id, { Rol}, { new: true }).select('-Contrasena');
        if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

        res.json({
            msg: "Rol actualizado",
            user
        });
    } catch (error) {
        res.status(500).json({ msg: "Error al cambiar rol", error });
    }
};

exports.activarUsuario = async (req, res) => {
    try{
    const user = await Usuario.findByIdAndUpdate(req.params.id, { Activo: true }, { new: true }).select('-Contrasena');
     if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });
    res.json({ msg: "Usuario activado", user });
    } catch(error){
        res.status(500).json({msg: 'Error al activar usuario', error});
    }
};

exports.desactivarUsuario = async (req, res) => {
  try {
    const user = await Usuario.findByIdAndUpdate(req.params.id,{ Activo: false },{ new: true }).select('-Contrasena');

    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

    res.json({ msg: 'Usuario desactivado', user });
  } catch (error) {
    res.status(500).json({ msg: 'Error al desactivar usuario', error });
  }
};

exports.cambiarPassword = async (req, res) => {
    try {
        const { passwordActual, passwordNueva } = req.body;
        const user = await Usuario.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });

        const valida = await user.validarPassword(passwordActual);
        if (!valida)
            return res.status(400).json({ msg: "La contraseña actual no es correcta" });

        user.Contrasena = passwordNueva;
        await user.save();

        res.json({ msg: "Contraseña actualizada correctamente" });

    } catch (error) {
        res.status(500).json({ msg: "Error al cambiar contraseña", error });
    }
};

exports.obtenerUsuarioPorId = async(req, res)=>{
try {
    const { id } = req.params;
    const user = await Usuario.findById(id).select('-Contrasena');

    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error al obtener usuario por id:', error);
    res.status(500).json({ msg: 'Error al obtener usuario', error: error.message });
  }
};

exports.actualizarUsuario = async(req, res) =>{
  try {
    const { id } = req.params;

    const camposPermitidos = [
      'NombreCompleto',
      'Email',
      'Telefono',
      'Especialidad',
      'NumeroColegiado',
      'Rol',
      'Activo'
    ];

    const data = {};
    for (const campo of camposPermitidos) {
      if (req.body[campo] !== undefined) {
        data[campo] = req.body[campo];
      }
    }

    const original = await Usuario.findById(id).select('-Contrasena');
    if (!original) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    const user = await Usuario.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).select('-Contrasena');

    res.json({
      msg: 'Usuario actualizado correctamente',
      user
    });

    let detalle = `Usuario ${original.Usuario} actualizado.`;
    if (original.Rol !== user.Rol) {
      detalle += ` Rol: ${original.Rol} → ${user.Rol}`;
    }

    try {
      await Log.create({
        UsuarioId: req.user?.id || req.user?._id,
        Accion: 'EDITAR_USUARIO',
        Detalle: detalle,
        IP: req.ip,
        UserAgent: req.headers['user-agent']
      });
    } catch (errLog) {
      console.error('Error registrando log editar usuario:', errLog.message);
    }

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ msg: 'Error al actualizar usuario', error: error.message });
  }
};
