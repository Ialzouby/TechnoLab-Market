const { defineModel } = require('../data/store');

const Offer = defineModel('Offer', {
  refs: { item: 'Item', buyer: 'User' },
  numbers: ['amount'],
  required: ['amount', 'item', 'buyer'],
  enums: { status: ['pending', 'rejected', 'accepted'] },
  defaults: {
    status: 'pending',
    createdAt: () => new Date(),
  },
});

module.exports = Offer;
