const jwt = require('jsonwebtoken');
require('dotenv').config();
const checkSessionToken = (req, res, next) => {
  console.log("Verificacion de sesion")
  const token = req.headers['authorization']?.split(' ')[1] || req.cookies.session; // Intenta obtener el token de los encabezados o de las cookies
  console.log(token)
  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied.' }); // Si no hay token, denegamos la solicitud
  }

  // Verifica el token usando la clave secreta que has usado para firmarlo
  jwt.verify(token, process.env.JWT_SECRET || 'contraseñaIzi', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' }); // Si el token no es válido o ha expirado
    }
    req.user = decoded; // Agrega el payload decodificado a la solicitud (opcional)
    next(); // Si el token es válido, pasa al siguiente middleware o ruta
  });
};

module.exports = checkSessionToken;