const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  seller: { type: String, required: true },
  condition: { type: String, enum: ['New', 'Like New', "Good", "Fair", "Poor"], required: true },
  price: { type: Number, required: true, min: 0.01 },
  details: { type: String, required: true },
  image: { type: String, default: 'default.jpg' },
  active: { type: Boolean, default: true }
});

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;

  