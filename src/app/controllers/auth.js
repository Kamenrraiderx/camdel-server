const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const User = require('../models/User'); // Asegúrate de tener un modelo de usuario

const validSession = async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                message: 'No token provided, authorization denied.',
                valid: false,
            });
        }

        // Verificar token de manera sincrónica
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'contraseñaIzi');

        // Si todo está bien, devolver que la sesión es válida
        return res.status(200).json({ valid: true });
    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(403).json({
                message: 'Invalid or expired token.',
                valid: false,
            });
        }
        // Si ocurre cualquier otro error
        return res.status(500).json({ valid: false });
    }
};
const login = async (req, res) => {
    const { user, password } = req.body;
    console.log(req.body);
    // Validar que se proporcionen ambos campos
    if (!user || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
    }

    try {
        // Buscar al usuario por el correo electrónico
        const newuser = await User.findOne({ user });
        if (!newuser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Comparar la contraseña ingresada con la almacenada en la base de datos
        const isMatch = await bcrypt.compare(password, newuser.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Crear un token JWT
        const token = jwt.sign(
            { userId: newuser._id, user: newuser.user },
            process.env.JWT_SECRET || 'contraseñaIzi', // Asegúrate de tener una clave secreta en tu .env
            { expiresIn: '4h' } // Token que expira en una hora
        );

        // Enviar respuesta con el token
        return res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = {
    login,
    validSession
};
