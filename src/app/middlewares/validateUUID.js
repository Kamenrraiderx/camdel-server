const { v4: isUUID } = require('uuid'); // Verificar que sea un UUID válido
const Link = require('../models/Links'); // Modelo para interactuar con la colección de guías

const validateUUID = async (req, res, next) => {
    try {
        const { uuid } = req.params;
        console.log("uuid: ",uuid)
        // Verificar si el formato del UUID es válido
        if (!isUUID(uuid)) {
            return res.status(400).json({ message: 'UUID inválido.' });
        }

        // Buscar el registro en la base de datos
        const link = await Link.findOne({ uuid });
        if (!link) {
            return res.status(404).json({ message: 'Link invalido.' });
        }

        // Verificar si la guía está activa
        if (!link.active) {
            return res.status(403).json({ message: 'Link inactivo.' });
        }

        // Verificar si la guía está vencida
        const now = new Date();
        if (link.expiracion && new Date(link.expiracion) < now) {
            return res.status(403).json({ message: 'Link vencido.' });
        }

        // Marcar la guía como utilizada
        // link.active = false; // Marcar como inactiva
        // link.used = true;    // Marcar como utilizada
        // link.usedAt = now;   // Registrar la fecha de uso
        await link.save();

        // Adjuntar la guía validada al objeto req
        req.link = link;

        // Continuar con el controlador principal
        next();
    } catch (error) {
        console.error('Error en el middleware de validación de UUID:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

module.exports = validateUUID;
