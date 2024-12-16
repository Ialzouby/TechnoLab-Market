const mongoose = require('mongoose');
const { escape } = require('validator');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  condition: { type: String, enum: ['New', 'Like-New', "Good", "Fair", "Poor"], required: true },
  price: { type: Number, required: true, min: 0.01 },
  details: { type: String, required: true, trim: true },
  image: { type: String, default: 'default.jpg' },
  active: { type: Boolean, default: true },
  totalOffers: { type: Number, default: 0 },
  highestOffer: { type: Number, default: 0 },
  category: { type: String, enum: ['PLA', 'ABS', 'PETG', 'Nylon', 'TPU'], required: true }
});

itemSchema.pre('save', function(next) {
  this.title = escape(this.title);
  this.details = escape(this.details);
  next();
});

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;

  