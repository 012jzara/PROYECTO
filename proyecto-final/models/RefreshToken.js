const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true, unique: true }, 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
  createdByIp: { type: String },
  revokedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);
