const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', dishController.create);
router.get('/', dishController.getAll);
router.get('/:id', dishController.getById);
router.put('/:id', dishController.update);
router.delete('/:id', dishController.remove);

// Ingredientes de un plato
router.post('/:id/ingredients', dishController.addIngredient);
router.get('/:id/ingredients', dishController.getIngredients);
router.put('/:id/ingredients/:ingredientId', dishController.updateIngredient);
router.delete('/:id/ingredients/:ingredientId', dishController.removeIngredient);

module.exports = router;

