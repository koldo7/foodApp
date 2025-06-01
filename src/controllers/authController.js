const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const register = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
  }
  userModel.findUserByEmail(email, (err, user) => {
    if (err) {
      console.error('Error finding user by email:', err);
      return res.status(500).json({ message: 'Error en el servidor durante el registro.' });
    }
    if (user) {
      return res.status(409).json({ message: 'El usuario ya existe.' });
    }
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).json({ message: 'Error al encriptar la contraseña.' });
      }
      userModel.createUser(email, hash, (err, userId) => {
        if (err) {
          console.error('Error creating user:', err);
          return res.status(500).json({ message: 'Error al crear el usuario.' });
        }
        // Generar un token JWT para el nuevo usuario
        const token = jwt.sign({ id: userId, email: email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.status(201).json({ message: 'Usuario registrado correctamente.', token: token });
      });
    });
  });
};

const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
  }
  userModel.findUserByEmail(email, (err, user) => {
    if (err) {
      console.error('Error finding user during login:', err);
      return res.status(500).json({ message: 'Error en el servidor durante el inicio de sesión.' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ message: 'Error en el servidor durante la comparación de contraseñas.' });
      }
      if (!isMatch) {
        return res.status(401).json({ message: 'Credenciales incorrectas.' });
      }
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      res.json({ token });
    });
  });
};

module.exports = {
  register,
  login,
};

