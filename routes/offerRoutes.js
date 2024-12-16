const express = require('express');
const router = express.Router({ mergeParams: true }); 
const offerController = require('../controllers/offerController');
const auth = require('../middleware/auth');

router.post('/', auth.isLoggedIn, offerController.makeOffer);
router.get('/', auth.isLoggedIn, offerController.viewOffers);
router.post('/:offerId/accept', auth.isLoggedIn, offerController.acceptOffer);
router.get('/:offerId/completePayment', auth.isLoggedIn, offerController.renderCompletePaymentPage);

module.exports = router;
