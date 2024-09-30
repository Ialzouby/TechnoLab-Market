// controllers/itemController.js

// controllers/itemController.js
const path = require('path');
const multer = require('multer');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images'); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });




const items = require('../models/itemModel');

exports.getAllItems = (req, res) => {
  const activeItems = items.filter(item => item.active);
  res.render('items', { items: activeItems });
};

exports.getItemDetails = (req, res) => {
  const item = items.find(item => item.id === parseInt(req.params.id));
  if (!item) {
    return res.render('error', { message: 'Item not found' });
  }
  res.render('item', { item });
};

exports.renderNewItemForm = (req, res) => {
  res.render('new');
};

exports.createItem = (req, res) => {
  const newItem = {
    id: items.length + 1, 
    title: req.body.title,
    seller: 'Issam Alzouby', 
    condition: req.body.condition,
    price: parseFloat(req.body.price),
    details: req.body.details,
    image: req.file ? `/images/${req.file.filename}` : 'default.jpg', 
    active: true,
  };

  items.push(newItem);
  res.redirect('/items');
};


exports.renderEditItemForm = (req, res) => {
  const item = items.find(item => item.id === parseInt(req.params.id));
  if (!item) {
    return res.render('error', { message: 'Item not found' });
  }
  res.render('edit', { item });
};

exports.updateItem = (req, res) => {
  const item = items.find(item => item.id === parseInt(req.params.id));
  if (!item) {
    return res.render('error', { message: 'Item not found' });
  }

  item.title = req.body.title;
  item.condition = req.body.condition;
  item.price = parseFloat(req.body.price);
  item.details = req.body.details;
  
  if (req.file) {
    item.image = `/images/${req.file.filename}`;
  }

  res.redirect('/items');
};


exports.deleteItem = (req, res) => {
  const index = items.findIndex(item => item.id === parseInt(req.params.id));
  if (index !== -1) {
    items.splice(index, 1);
  }
  res.redirect('/items');
};
