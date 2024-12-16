const User = require('../models/userModel'); 
const Item = require('../models/itemModel');
const Review = require('../models/reviewModel');
const bcrypt = require('bcrypt');
const flash = require('connect-flash');
const Offer = require('../models/offerModel');
const { body, validationResult } = require('express-validator');

// Render the sign-up form
exports.renderSignupForm = (req, res) => {
    res.render('user/new', { messages: req.flash() });
};

// Helper function to safely redirect back
const safeRedirectBack = (req, res, fallback = '/') => {
    const referrer = req.get('Referrer');
    res.redirect(referrer || fallback);
  };


exports.viewSellerProfile = async (req, res) => {
    try {
        const sellerId = req.params.id;
        const seller = await User.findById(sellerId);
        if (!seller) {
            return res.status(404).render('error', { message: 'Seller not found' });
        }

        // Fetch both active and inactive listings
        const items = await Item.find({ seller: sellerId }).sort({ active: -1, createdAt: -1 }); // Active first, then by creation date
        const reviews = await Review.find({ reviewedUser: sellerId }).populate('reviewer', 'firstName lastName');

        res.render('user/sellerProfile', { seller, items, reviews });
    } catch (error) {
        console.error('Error viewing seller profile:', error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
};


exports.addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const reviewedUserId = req.params.id;
        const reviewerId = req.session.userId;

        if (reviewerId === reviewedUserId) {
            req.flash('error', 'You cannot review yourself.');
            return res.redirect('back');
        }

        const review = new Review({
            reviewer: reviewerId,
            reviewedUser: reviewedUserId,
            rating,
            comment
        });

        await review.save();
        req.flash('success', 'Review added successfully!');
        res.redirect(`/users/${reviewedUserId}`);
    } catch (error) {
        console.error('Error adding review:', error);
        req.flash('error', 'Failed to add review. Please try again.');
        res.redirect('back');
    }
};
  


exports.signup = [
    // Validation middleware
    body('firstName').trim().escape().notEmpty().withMessage('First name is required'),
    body('lastName').trim().escape().notEmpty().withMessage('Last name is required'),
    body('email').normalizeEmail().isEmail().withMessage('Please provide a valid email address'),
    body('password').isLength({ min: 8, max: 64 }).withMessage('Password must be between 8 and 64 characters'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Collect error messages
            const errorMessages = errors.array().map(err => err.msg);
            req.flash('error', errorMessages.join(', '));
            return res.render('user/new', { messages: req.flash() });
        }

        try {
            const { firstName, lastName, email, password } = req.body;

            // Check if the email is already in use
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                req.flash('error', 'Email is already registered.');
                return res.render('user/new', { messages: req.flash() });
            }

            // Hash the password and create a new user
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({ firstName, lastName, email, password: hashedPassword });

            await newUser.save();
            req.flash('success', 'Sign-up successful! Please log in.');
            return res.redirect('/users/login');
        } catch (error) {
            if (error.name === 'ValidationError') {
                // Collect all error messages
                const errorMessages = Object.values(error.errors).map(val => val.message);
                req.flash('error', `User validation failed: ${errorMessages.join(', ')}`);
                return res.redirect('/users/new');
            } else {
                req.flash('error', 'Oops! Something went wrong.');
                return res.redirect('/users/new');
            }
        }
    }
];


// Render the login form
exports.renderLoginForm = (req, res) => {
    res.render('user/login');
};

exports.login = [

    body('email')
    .normalizeEmail()
    .isEmail().withMessage('Please provide a valid email address')
    .notEmpty().withMessage('Email is required'),

    body('password')
        .isLength({ min: 8, max: 64 }).withMessage('Password must be between 8 and 64 characters')
        .notEmpty().withMessage('Password is required'),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        req.flash('error', errorMessages.join(', '));
        return res.render('user/login', { messages: req.flash() });
    }



    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        // Check if the user exists and if the password is valid
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id;
            req.flash('success', 'Login successful!');

            // Ensure the session is saved before redirecting
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    req.flash('error', 'An error occurred while saving your session. Please try again.');
                    return res.redirect('/users/login');
                }
                return res.redirect('/users/profile');
            });
        } else {
            // Incorrect email or password
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/users/login');
        }
    } catch (error) {
        // Log the error for debugging
        console.error('Login error:', error);
        req.flash('error', ' 404 An unexpected error occurred. Please try again.');
        return res.redirect('/users/login');
    }
}];

exports.viewProfile = async (req, res) => {
    if (!req.session.userId) {
        req.flash('error', '401 - You need to log in to view your profile.');
        return res.redirect('/users/login');
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            req.flash('error', '404 - User not found.');
            return res.redirect('/users/login');
        }
        
        const items = await Item.find({ seller: user._id });

        // Fetch all offers the user has made
        const offers = await Offer.find({ buyer: user._id }).populate('item');

        res.render('user/profile', { user, items, offers });
    } catch (error) {
        console.error('Profile view error:', error);
        req.flash('error', '401 - Failed to load profile. Please try again later.');
        res.redirect('back');
    }
};

exports.logout = (req, res) => {
    // Check if the user is logged in
    if (!req.session.userId) {
        req.flash('error', 'You are not logged in, so you cannot log out.');
        return res.redirect('/users/login');
    }

    req.session.userId = null;

    req.session.regenerate((err) => {
        if (err) {
            console.error('Session regeneration error:', err);
            req.flash('error', 'Could not complete logout. Please try again.');
            return res.redirect('/users/profile'); 
        }

        res.clearCookie('connect.sid');
        
        req.flash('success', 'You have logged out successfully.');

        res.redirect('/');
    });
};



