const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const upload = itemController.upload;
const multer = require('multer');
const path = require('path');

//file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images'); 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});


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


module.exports = router;
