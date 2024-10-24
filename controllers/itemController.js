const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const Item = require('../models/itemModel');

//file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images'); 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });
module.exports.upload = upload;

exports.getItemDetails = async (req, res) => {
  try {
    const itemId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).render('error', { message: 'Invalid Item ID' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).render('error', { message: `There is no item with ID "${itemId}"` });
    }    
    res.render('item', { item });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Internal Server Error' });
  }
};

exports.renderNewItemForm = (req, res) => {
  res.render('new');
};

exports.createItem = async (req, res) => {
  try {
    const newItem = {
      title: req.body.title,
      seller: req.body.seller,
      condition: req.body.condition,
      price: parseFloat(req.body.price),
      details: req.body.details,
      image: req.file ? `/images/${req.file.filename}` : 'default.jpg',
      active: true
    };
    await Item.create(newItem); 
    res.redirect('/items/${newItem._id}');
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).render('error', { message: `Item validation failed: ${error.message}` });
    }
    next(error);
  }
};


exports.renderEditItemForm = async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await Item.findById(itemId);
    if (!item) {
      return res.render('error', { message: `There is no item with ID "${itemId}"` });
    }
    res.render('edit', { item });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Internal Server Error' });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const itemId = req.params.id;

    const updatedData = {
      title: req.body.title,
      seller: req.body.seller,
      condition: req.body.condition,
      price: parseFloat(req.body.price),
      details: req.body.details,
    };

    if (req.file) {
      updatedData.image = `/images/${req.file.filename}`;
    }

    const item = await Item.findByIdAndUpdate(itemId, updatedData, { new: true });
    if (!item) {
      return res.status(404).render('error', { message: `There is no item with ID "${itemId}"` });
    }
    res.redirect(`/items/${item.id}`);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).render('error', { message: `Item validation failed: ${error.message}` });
    }
    next(error);
  }
};


exports.deleteItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await Item.findByIdAndDelete(itemId);
    if (!item) {
      return res.status(404).render('error', { message: `There is no item with ID "${itemId}"` });
    }    
    res.redirect('/items');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Internal Server Error' });
  }
};





exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find({ active: true }).sort('price'); // Sorting by price in ascending order
    res.render('items', { items });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Internal Server Error' });
  }
};




exports.searchItems = async (req, res) => {
  try {
    const searchTerm = req.query.q;
    if (!searchTerm) {
      return res.redirect('/items');
    }

    const keywords = searchTerm.trim().split(/\s+/);
    const regexArray = keywords.map(keyword => ({
      $or: [
        { title: { $regex: keyword, $options: 'i' } },  
        { details: { $regex: keyword, $options: 'i' } } 
      ]
    }));

    const filteredItems = await Item.find({
      $and: regexArray,
      active: true
    });

    if (filteredItems.length === 0) {
      return res.status(404).render('error', { message: 'Item not found' });
    }    

    res.render('items', { items: filteredItems, searchTerm });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Internal Server Error' });
  }
};

