const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads', 'dishes'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Solo se permiten imágenes jpg, jpeg y png!'), false);
    }
    cb(null, true);
  }
});

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas de platos
router.post('/', upload.single('photo'), dishController.create);
router.get('/', dishController.getAll);
router.get('/:id', dishController.getById);
router.put('/:id', upload.single('photo'), dishController.update);
router.delete('/:id', dishController.remove);

// Rutas de ingredientes de platos
router.post('/:id/ingredients', dishController.addIngredient);
router.get('/:id/ingredients', dishController.getIngredients);
router.put('/:id/ingredients/:ingredientId', dishController.updateIngredient);
router.delete('/:id/ingredients/:ingredientId', dishController.removeIngredient);

module.exports = router;

