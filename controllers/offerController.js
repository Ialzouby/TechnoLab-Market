const Offer = require('../models/offerModel');
const Item = require('../models/itemModel');

exports.makeOffer = async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await Item.findById(itemId);

        if (!item || !item.active) {
            req.flash('error', 'Cannot make an offer on this item.');
            return res.redirect('back');
        }

        if (item.seller.equals(req.session.userId)) {
            req.flash('error', 'You own this product and cannot place a bid.');
            return res.redirect(`/items/${itemId}`);
        }

        // Create a new offer for each bid
        const offer = await Offer.create({
            amount: req.body.amount,
            item: itemId,
            buyer: req.session.userId
        });

        await Item.findByIdAndUpdate(itemId, {
            $inc: { totalOffers: 1 },
            $max: { highestOffer: offer.amount }
        });

        req.flash('success', 'Offer made successfully.');
        res.redirect(`/items/${itemId}`);
    } catch (error) {
        console.error('Error making offer:', error);
        req.flash('error', 'An error occurred while making your offer.');
        res.redirect(`/items/${itemId}`);
    }
};
exports.viewOffers = async (req, res) => {
    try {
        const itemId = req.params.id;

        if (!req.session.userId) {
            return res.status(401).render('error', { message: 'You must be logged in to view offers.' });
        }

        const item = await Item.findById(itemId).populate('seller');

        if (!item || !item.seller.equals(req.session.userId)) {
            return res.status(401).render('error', { message: 'Unauthorized access to this item\'s offers.' });
        }

        const offers = await Offer.find({ item: itemId }).populate('buyer');
        res.render('offers/offers', { item, offers });
    } catch (error) {
        console.error('Error viewing offers:', error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
};

exports.acceptOffer = async (req, res) => {
    try {
        const offerId = req.params.offerId;
        const offer = await Offer.findById(offerId).populate('item');

        if (!offer || !offer.item.seller.equals(req.session.userId)) {
            req.flash('error', 'Unauthorized access.');
            return res.redirect('back');
        }

        offer.status = 'accepted';
        await offer.save();

        // Reject other offers and deactivate item
        await Offer.updateMany({ item: offer.item._id, _id: { $ne: offerId } }, { status: 'rejected' });
        offer.item.active = false;
        await offer.item.save();

        req.flash('success', 'Offer accepted.');
        res.redirect(`/items/${offer.item._id}/offers`);
    } catch (error) {
        console.error('Error accepting offer:', error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
};

exports.completePayment = async (req, res) => {
    try {
        const offerId = req.params.offerId;
        const offer = await Offer.findById(offerId).populate('item');

        if (!offer || offer.status !== 'accepted') {
            req.flash('error', 'Invalid offer or offer not accepted.');
            return res.redirect('back');
        }

        //  payment logic here
    

        req.flash('success', 'Payment completed successfully.');
        res.redirect(`/items/${offer.item._id}`);
    } catch (error) {
        console.error('Error completing payment:', error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
};

exports.renderCompletePaymentPage = async (req, res) => {
    try {
        const offerId = req.params.offerId;
        const offer = await Offer.findById(offerId).populate('item');

        if (!offer || offer.status !== 'accepted') {
            req.flash('error', 'Invalid offer or offer not accepted.');
            return res.redirect('back');
        }

        res.render('offers/completePayment', { offer });
    } catch (error) {
        console.error('Error rendering complete payment page:', error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
};


