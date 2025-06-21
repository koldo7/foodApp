const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  console.log('authMiddleware: Starting authentication check...');
  const authHeader = req.headers['authorization'];
  console.log('authMiddleware: Auth header:', authHeader);
  
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.error('authMiddleware: No token provided');
    return res.status(401).json({ message: 'Token no proporcionado.' });
  }
  
  console.log('authMiddleware: Verifying token...');
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) {
      console.error('authMiddleware: Token verification failed:', err);
      return res.status(403).json({ message: 'Token inválido.' });
    }
    console.log('authMiddleware: Token verified successfully, user:', user);
    req.user = user;
    next();
  });
};

module.exports = authMiddleware;

