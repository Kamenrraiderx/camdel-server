const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Crear el esquema de usuario
const userSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
}, { timestamps: true });

// Encriptar la contraseña antes de guardar el usuario
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        // Encriptar la contraseña con bcrypt
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Crear el modelo de usuario
const User = mongoose.model('users', userSchema);

module.exports = User;
