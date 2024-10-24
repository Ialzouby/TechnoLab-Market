const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const upload = itemController.upload;
const path = require('path');

// routes
router.get('/', itemController.getAllItems);
router.get('/search', itemController.searchItems);
router.get('/item/:id', itemController.getItemDetails);
router.get('/new', itemController.renderNewItemForm);
router.post('/new', upload.single('image'), itemController.createItem); 
router.get('/edit/:id', itemController.renderEditItemForm);
router.post('/edit/:id', upload.single('image'), itemController.updateItem);
router.post('/delete/:id', itemController.deleteItem);
router.get('/:id', itemController.getItemDetails);
router.post('/delete/:id', itemController.deleteItem);

router.get('/signup', (req, res) => {
  res.render('signup');
})

router.get('/login', (req, res) => {
  res.render('login');  
});

module.exports = router;
