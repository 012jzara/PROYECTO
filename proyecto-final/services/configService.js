const Config = require('../models/Configuracion');

async function obtenerConfig(clave, tienda = null) {
  const claveUpper = clave.toUpperCase();

  const filtro = {
    Clave: claveUpper,
    Activo: true
  };

  if (tienda) {
    filtro.Tienda = { $in: [tienda, 'GLOBAL'] };
  } else {
    filtro.Tienda = 'GLOBAL';
  }

  const config = await Config.findOne(filtro)
    .sort({ Tienda: -1 }) 
    .lean();

  return config || null;
}

async function obtenerNumero(clave, tienda = null, porDefecto = null) {
  const config = await obtenerConfig(clave, tienda);
  if (!config) return porDefecto;

  const valor = config.Valor;
  if (typeof valor === 'number') return valor;

  const convertido = Number(valor);
  if (isNaN(convertido)) return porDefecto;
  return convertido;
}

async function obtenerBooleano(clave, tienda = null, porDefecto = false) {
  const config = await obtenerConfig(clave, tienda);
  if (!config) return porDefecto;

  const valor = config.Valor;
  if (typeof valor === 'boolean') return valor;

  if (typeof valor === 'string') {
    if (valor.toLowerCase() === 'true') return true;
    if (valor.toLowerCase() === 'false') return false;
  }

  return porDefecto;
}

async function obtenerString(clave, tienda = null, porDefecto = null) {
  const config = await obtenerConfig(clave, tienda);
  if (!config) return porDefecto;

  return String(config.Valor);
}

module.exports = {
  obtenerConfig,
  obtenerNumero,
  obtenerBooleano,
  obtenerString
};
