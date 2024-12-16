const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const upload = itemController.upload;
const path = require('path');
const auth = require('../middleware/auth');
const validator = require('../middleware/validator');
const offerRoutes = require('./offerRoutes');


router.get('/', itemController.getAllItems);


router.use('/:id/offers', offerRoutes);


router.get('/search', itemController.searchItems);

// Logged-in-only routes
router.get('/new', auth.isLoggedIn, itemController.renderNewItemForm);
router.post('/new', auth.isLoggedIn, upload.single('image'), validator.validateNewItem, itemController.createItem);
router.post('/items', auth.isLoggedIn, itemController.createItem);

// Seller-only routes for editing/deleting
router.get('/:id/edit', auth.isLoggedIn, auth.isSeller, itemController.renderEditItemForm);
router.post('/:id/edit', auth.isLoggedIn, upload.single('image'), auth.isSeller, validator.validateNewItem, itemController.updateItem);
router.get('/:id/delete', auth.isLoggedIn, auth.isSeller, itemController.deleteItem);

router.post('/:id/delete', auth.isLoggedIn, auth.isSeller, itemController.deleteItem);
router.delete('/:id/', auth.isLoggedIn, auth.isSeller, itemController.deleteItem);

router.put('/:id', auth.isLoggedIn, auth.isSeller, itemController.updateItem);

router.get('/item/:id', itemController.getItemDetails); 
router.get('/:id', itemController.getItemDetails);

module.exports = router;
