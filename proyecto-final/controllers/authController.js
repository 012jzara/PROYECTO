const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Usuario = require('../models/Usuario');
const RefreshToken = require('../models/RefreshToken');

function generateAccessToken(user) {
  return jwt.sign({ id: user._id, Usuario: user.Usuario, Rol: user.Rol }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '180m' });
}

function generateRefreshTokenString() {
  return crypto.randomBytes(64).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function parseExpiry(str, fallbackMs = 7 * 24 * 3600 * 1000) {
  if (!str) return fallbackMs;
  if (/^\d+$/.test(str)) return parseInt(str, 10);
  const unit = str.slice(-1);
  const num = parseInt(str.slice(0, -1), 10);
  switch (unit) {
    case 'd': return num * 24 * 3600 * 1000;
    case 'h': return num * 3600 * 1000;
    case 'm': return num * 60 * 1000;
    case 's': return num * 1000;
    default: return fallbackMs;
  }
}

async function createRefreshTokenRecord(user, ip) {
  const tokenString = generateRefreshTokenString();
  const tokenHash = hashToken(tokenString);
  const ttl = parseExpiry(process.env.REFRESH_TOKEN_EXPIRES_IN || '7d');
  const expiresAt = new Date(Date.now() + ttl);

  const refresh = new RefreshToken({
    tokenHash,
    userId: user._id,
    expiresAt,
    createdByIp: ip
  });
  await refresh.save();
  return { tokenString, refresh };
}

exports.login = async (req, res) => {
  try {
    const { Usuario: username, Contrasena } = req.body;
    if (!username || !Contrasena) return res.status(400).json({ msg: 'Credenciales requeridas' });

    const user = await Usuario.findOne({ Usuario: username });
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });
    if (!user.Activo) return res.status(403).json({ msg: 'Cuenta desactivada' });

    const valid = await user.validarPassword(Contrasena);
    if (!valid) return res.status(401).json({ msg: 'Credenciales inválidas' });

    const accessToken = generateAccessToken(user);
    const { tokenString: refreshToken } = await createRefreshTokenRecord(user, req.ip);

    res.json({
      accessToken,
      refreshToken,
      user: user.toJSON()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error en login' });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ msg: 'Refresh token requerido' });

    const tokenHash = hashToken(refreshToken);
    const stored = await RefreshToken.findOne({ tokenHash });

    if (!stored || stored.revoked) return res.status(401).json({ msg: 'Refresh token inválido' });
    if (stored.expiresAt < new Date()) return res.status(401).json({ msg: 'Refresh token expirado' });

    const user = await Usuario.findById(stored.userId);
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });
    if (!user.Activo) return res.status(403).json({ msg: 'Cuenta desactivada' });

    stored.revoked = true;
    stored.revokedAt = new Date();
    await stored.save();

    const { tokenString: newRefreshToken } = await createRefreshTokenRecord(user, req.ip);
    const newAccessToken = generateAccessToken(user);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error en refresh' });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ msg: 'Refresh token requerido' });
    }

    const tokenHash = hashToken(refreshToken);
    const doc = await RefreshToken.findOne({ tokenHash });
    if (doc) {
      doc.revoked = true;
      doc.revokedAt = new Date();
      await doc.save();
    }

    res.json({ msg: 'Logout ok' });
    try {
      const usuarioId = req.user?.id || req.user?._id || null;
      await Log.create({
        UsuarioId: usuarioId,
        Accion: 'LOGOUT',
        Detalle: `Cierre de sesión`,
        IP: req.ip,
        UserAgent: req.headers['user-agent']
      });
    } catch (errLog) {
      console.error('Error registrando log de logout:', errLog.message);
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Error en logout' });
  }
};
