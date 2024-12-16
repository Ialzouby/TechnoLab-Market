const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    amount: { type: Number, required: [true, 'Amount is required'], min: [0.01, 'Amount must be greater than 0']},
    status: { type: String, enum: ['pending', 'rejected', 'accepted'], default: 'pending' },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Offer = mongoose.model('Offer', offerSchema);
module.exports = Offer;
