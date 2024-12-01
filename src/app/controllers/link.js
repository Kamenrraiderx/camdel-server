const { v4: uuidv4 } = require('uuid'); // Importamos uuid para generar un ID único
const Link = require('../models/Links.js'); // Importamos el modelo de Link
require('dotenv').config();

const getLinks = async (req, res) => {
  try {
    // Busca los links con estado activo
    const activeLinks = await Link.find({ active: true });

    if (activeLinks.length === 0) {
      return res.status(404).json({ message: 'No hay links activos.' });
    }
    const formatLinks = activeLinks.map(link => {
      const { uuid, titulo, proposito, duracion, expiracion, active } = link
      return {
        uuid,
        titulo,
        proposito,
        duracion,
        expiracion,
        active
      }
    })
    res.status(200).json(formatLinks);
  } catch (error) {
    console.error('Error al obtener los links activos:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
}


const deleteLinks = async (req, res) => {
  const { uuid } = req.params;

  try {
    // Buscar y eliminar el documento
    const deletedLink = await Link.findOneAndDelete({ uuid });

    if (!deletedLink) {
      return res.status(404).json({ message: 'Link no encontrado' });
    }

    res.status(200).json({ message: 'Link eliminado exitosamente', link: deletedLink });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error eliminando el link', error });
  }
}


const setActive = async (req, res) => {
  const { uuid } = req.params;
  const { active } = req.body; // Esperamos el valor de active en el cuerpo de la solicitud

  if (typeof active !== 'boolean') {
    return res.status(400).json({ message: '"active" debe ser un valor booleano' });
  }

  try {
    // Buscar y actualizar el documento
    const updatedLink = await Link.findOneAndUpdate(
      { uuid },
      { active },
      { new: true } // Retorna el documento actualizado
    );

    if (!updatedLink) {
      return res.status(404).json({ message: 'Link no encontrado' });
    }

    res.status(200).json({ message: 'Valor de "active" actualizado exitosamente', link: updatedLink });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error actualizando el valor de "active"', error });
  }
}


const createLink = async (req, res) => {
  try {
    const { titulo, proposito, duracion } = req.body;

    // Verificar que los datos necesarios estén presentes
    if (!titulo || !proposito) {
      return res.status(400).json({ message: 'Faltan campos obligatorios (titulo, proposito).' });
    }

    // Calcular la fecha de expiración si se proporciona duración
    let expiracion = null;
    if (duracion) {
      const [valor, unidad] = duracion.split(' '); // Esperamos formato como "5 dias", "2 horas", etc.
      const duracionNumero = parseInt(valor);

      if (isNaN(duracionNumero)) {
        return res.status(400).json({ message: 'Duración no válida.' });
      }

      // Crear la fecha de expiración según la unidad
      if (unidad === 'minutes') {
        expiracion = new Date(Date.now() + duracionNumero * 60000); // 60000 ms en 1 minuto
      } else if (unidad === 'hours') {
        expiracion = new Date(Date.now() + duracionNumero * 3600000); // 3600000 ms en 1 hora
      } else if (unidad === 'days') {
        expiracion = new Date(Date.now() + duracionNumero * 86400000); // 86400000 ms en 1 día
      } else {
        return res.status(400).json({ message: 'Unidad de duración no válida.' });
      }
    } else {
      // Si no hay duración, el enlace no expira (opcionalmente, podrías poner una expiración predeterminada)
      expiracion = new Date(Date.now() + 86400000); // Default: 1 día de expiración
    }

    // Crear un nuevo UUID único para el enlace
    const uuid = uuidv4();

    // Crear el enlace en la base de datos
    const newLink = new Link({
      uuid,
      titulo,
      proposito,
      duracion,
      expiracion,
      estado: 'activo',
    });

    // Guardar el enlace en la base de datos
    await newLink.save();

    // Devolver el enlace creado
    res.status(201).json({
      uuid,
      titulo,
      proposito,
      duracion,
      expiracion,
      active: true
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear el enlace' });
  }
};

module.exports = { createLink, getLinks, deleteLinks,setActive };
