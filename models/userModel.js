const { defineModel } = require('../data/store');

const User = defineModel('User', {
  required: ['firstName', 'lastName', 'email', 'password'],
  defaults: { createdAt: () => new Date() },
});

module.exports = User;
