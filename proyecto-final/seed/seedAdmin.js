const Usuario = require('../models/Usuario');

async function seedAdminIfMissing() {
  const existe = await Usuario.exists({ Rol: 'Admin' });
  if (existe) {
    console.log('ℹ️ Admin ya existe, no se crea seed.');
    return;
  }

  const admin = new Usuario({
    Usuario: 'admin',
    Contrasena: 'admin123',   // se hashea con tu pre('save')
    NombreCompleto: 'Administrador',
    Email: 'admin@biopets.local',
    Rol: 'Admin',
    Activo: true
  });

  await admin.save();
  console.log('✅ Admin inicial creado: usuario=admin clave=admin123');
}

module.exports = { seedAdminIfMissing };
