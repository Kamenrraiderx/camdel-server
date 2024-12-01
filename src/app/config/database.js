const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = async () => {
    try {
        const dbURI = process.env.MONGODB_URI || '';
        await mongoose.connect(dbURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Conexión a la base de datos exitosa');
        
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
