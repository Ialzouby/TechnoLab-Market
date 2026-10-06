const { defineModel } = require('../data/store');

const Item = defineModel('Item', {
  refs: { seller: 'User' },
  numbers: ['price', 'totalOffers', 'highestOffer'],
  required: ['title', 'condition', 'price', 'details', 'category'],
  enums: {
    condition: ['New', 'Like-New', 'Good', 'Fair', 'Poor'],
    category: ['PLA', 'ABS', 'PETG', 'Nylon', 'TPU'],
  },
  defaults: {
    image: 'default.jpg',
    active: true,
    totalOffers: 0,
    highestOffer: 0,
    createdAt: () => new Date(),
  },
});

module.exports = Item;
