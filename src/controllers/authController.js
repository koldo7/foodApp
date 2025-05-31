const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const register = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
  }
  userModel.findUserByEmail(email, (err, user) => {
    if (user) {
      return res.status(409).json({ message: 'El usuario ya existe.' });
    }
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return res.status(500).json({ message: 'Error al encriptar la contraseña.' });
      userModel.createUser(email, hash, (err, userId) => {
        if (err) return res.status(500).json({ message: 'Error al crear el usuario.' });
        res.status(201).json({ message: 'Usuario registrado correctamente.' });
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
    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }
    bcrypt.compare(password, user.password, (err, isMatch) => {
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

