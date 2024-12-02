
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const clientConnection = require('./app/connection/whatsappClient.js');
const connectDB = require('./app/config/database.js');
const sendGuideRoutes = require('./app/routes/sendGuides.js');
const linkRoutes = require('./app/routes/link.js');
const auth = require('./app/routes/auth.js');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;



async function startApp() {
  try {
    await connectDB();

    let client = await clientConnection();

    app.use(cors({
      origin: 'https://camdel-front-en7z3kvdg-anibal-reyes-projects.vercel.app',  // Permitir tu túnel de Cloudflare
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,  // Si estás usando cookies o cabeceras de autenticación
    }));

    // Usa el cliente en tu aplicación
    app.use((req, res, next) => {
      req.client = client;
      res.setHeader(
        "Content-Security-Policy",
        "default-src *; img-src *; script-src 'self'; style-src 'self';"
      );
      next();
    });


    // Middleware para procesar JSON y datos codificados
    app.use(express.static('./public'));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(express.json());
    app.set('view engine', 'ejs');

    app.use('/v1', sendGuideRoutes);
    app.use('/v1', auth);
    app.use('/v1', linkRoutes);
    app.use(express.static('./public'));

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });

  } catch (err) {
    console.error('Error starting the app:', err);
  }
}

startApp();
