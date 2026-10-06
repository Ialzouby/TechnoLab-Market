const { defineModel } = require('../data/store');

const Review = defineModel('Review', {
  refs: { reviewer: 'User', reviewedUser: 'User' },
  numbers: ['rating'],
  required: ['reviewer', 'reviewedUser', 'rating', 'comment'],
  defaults: { createdAt: () => new Date() },
});

module.exports = Review;
