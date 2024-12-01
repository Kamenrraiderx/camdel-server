const mongoose = require('mongoose');

// Crear el esquema para los enlaces de un solo uso
const linkSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    unique: true,
  },
  titulo: {
    type: String,
    required: true,
  },
  proposito: {
    type: String,
    required: true,
  },
  duracion: {
    type: String,
    required: false,
  },
  expiracion: {
    type: Date,
    required: true,
  },
  estado: {
    type: String,
    enum: ['activo', 'usado', 'expirado'],
    default: 'activo',
  },
  active: {
    type: Boolean,
    default: true,
  },
});

const Link = mongoose.model('links', linkSchema);

module.exports = Link;
