const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', ingredientController.create);
router.get('/', ingredientController.getAll);
router.get('/:id', ingredientController.getById);
router.put('/:id', ingredientController.update);
router.delete('/:id', ingredientController.remove);

module.exports = router;

