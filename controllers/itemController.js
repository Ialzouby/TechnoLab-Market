const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const Item = require('../models/itemModel');
const Offer = require('../models/offerModel');

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
      return res.status(400).render('error', { message: '400 Error - Invalid Item ID' });
    }

    const item = await Item.findById(itemId).populate('seller', 'firstName lastName');

    if (!item) {
      return res.status(404).render('error', { message: `404 Error - No item with ID "${itemId}"` });
    }

    const offerCount = await Offer.countDocuments({ item: itemId });

    // Fetch the highest offer for the item
    const highestOffer = await Offer.findOne({ item: itemId })
      .sort({ amount: -1 }) // Sort offers by amount in descending order
      .exec();

    // Ensure `highestOffer` is explicitly defined, even if no offers exist
    res.render('item', { item, offerCount, highestOffer: highestOffer || null, currentUserId: req.session.userId });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Internal Server Error' });
  }
};




exports.renderNewItemForm = (req, res) => {
  res.render('new');
};

exports.createItem = async (req, res) => {
  console.log('Form Data:', req.body);
  console.log('File:', req.file);
  try {
    const newItem = {
      title: req.body.title,
      seller: req.session.userId,
      condition: req.body.condition,
      price: parseFloat(req.body.price),
      details: req.body.details,
      category: req.body.category,
      image: req.file ? `/images/${req.file.filename}` : 'default.jpg',
      active: true
    };
    await Item.create(newItem); 
    req.flash('success', 'Item created successfully');
    res.redirect('/items');
  } catch (error) {
    if (error.name === 'ValidationError') {
      req.flash('error', `Item validation failed: ${error.message}`);
      return res.redirect('back');
    }
    res.status(500).render('error', { message: '500 - Internal Server Error' });
  }
};



exports.renderEditItemForm = async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await Item.findById(itemId);

    if (!item || !item.seller.equals(req.session.userId)) {
      return res.status(401).render('error', { message: '401 Error - Unauthorized access' });
    }

    const conditionOptions = Item.schema.path('condition').enumValues;
    const categoryOptions = Item.schema.path('category').enumValues; 

    res.render('edit', { item, conditionOptions, categoryOptions });
  } catch (error) {
    res.status(500).render('error', { message: '500 Error - Internal Server Error' });
  }
};



exports.updateItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await Item.findById(itemId);

    if (!item || !item.seller.equals(req.session.userId)) {
      return res.status(401).render('error', { message: 'Unauthorized access' });
    }

    // Update item fields
    item.title = req.body.title;
    item.condition = req.body.condition;
    item.category = req.body.category;
    item.price = parseFloat(req.body.price);
    item.details = req.body.details;
    if (req.file) {
      item.image = `/images/${req.file.filename}`;
    }

    await item.save();
    req.flash('success', 'Item updated successfully');
    res.redirect(`/items/${item._id}`);
  } catch (error) {
    if (error.name === 'ValidationError') {
      req.flash('error', `Item validation failed: ${error.message}`);
      return res.redirect('back');
    }
    res.status(500).render('error', { message: 'Internal Server Error' });
  }
};

exports.deleteItem = async (req, res) => {
  try {
      const itemId = req.params.id;
      const referrer = req.get('Referrer') || '';
      
      if (!mongoose.Types.ObjectId.isValid(itemId)) {
          req.flash('error', 'Invalid Item ID');
          return res.redirect('back');
      }

      const item = await Item.findById(itemId);
      
      if (!item) {
          req.flash('error', 'Item not found');
          return res.redirect('back');
      }

      if (!item.seller.equals(req.session.userId)) {
          req.flash('error', 'Unauthorized');
          return res.redirect('back');
      }

      // Delete all offers for the item
      await Offer.deleteMany({ item: itemId });

      await Item.findByIdAndDelete(itemId);
      req.flash('success', 'Item deleted successfully');
      
      // Check if the delete request came from the profile page
      if (referrer.includes('/profile')) {
          res.redirect('/users/profile');
      } else {
          res.redirect('/users/items');
      }
      
  } catch (error) {
      console.error('Delete error:', error);
      req.flash('error', 'Failed to delete item');
      res.redirect('back');
  }
};


exports.getAllItems = async (req, res) => {
    try {
        const { category, condition } = req.query;
        const filter = { active: true };

        if (category) {
            filter.category = category;
        }

        if (condition) {
            filter.condition = condition;
        }

        const items = await Item.find(filter)
            .sort({ price: 1 })
            .populate('seller', 'firstName lastName');

        for (let item of items) {
            const offersCount = await Offer.countDocuments({ item: item._id });
            item.offersCount = offersCount;
        }

        res.render('items', { items, category, condition });
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

    // Check if any items match
    if (filteredItems.length === 0) {
      return res.render('items', { items: [], searchTerm, noResults: true });
    }    

    res.render('items', { items: filteredItems, searchTerm, noResults: false });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Internal Server Error' });
  }
};

