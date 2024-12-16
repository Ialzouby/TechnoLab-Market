// auth.js
const Item = require('../models/itemModel');

// Middleware to check if the user is logged in
function isLoggedIn(req, res, next) {
    if (req.session.userId) {
        return next();
    } else {
        // User is not logged in
        if (req.path === '/logout') {
            req.flash('error', 'You are not logged in, so you cannot log out.');
            return res.redirect('/users/login');
        }

        req.flash('error', '401 - You need to be logged in to access this page.');
        return res.redirect('/users/login');
    }
}


function isGuest(req, res, next) {
    if (!req.session.userId) {
        next(); // Proceed if the user is not logged in
    } else {
        // Check the requested URL to customize the flash message
        if (req.originalUrl === '/users/new') {
            req.flash('error', 'You are already signed up.');
        } else if (req.originalUrl === '/users/login') {
            req.flash('error', 'You are already logged in.');
        }
        // Save the session and then redirect
        req.session.save(() => {
            res.redirect('/users/profile');
        });
    }
}

// Middleware to ensure only the seller can edit/delete an item
async function isSeller(req, res, next) {
    try {
        const itemId = req.params.id;
        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(404).render('error', { message: '404 - Item not found' }); 
        }

        if (item.seller.equals(req.session.userId)) {
            next(); 
        } else {
            
            res.status(401).render('error', { message: '401 - Unauthorized access' });
        }
    } catch (error) {
        console.error('isSeller middleware error:', error);
        res.status(500).render('error', { message: '500 - Internal Server Error' });
    }
}
module.exports = { isLoggedIn, isGuest, isSeller };