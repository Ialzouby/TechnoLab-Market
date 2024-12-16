const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth'); // Import your auth middleware

// Guest-only routes
router.get('/new', auth.isGuest, userController.renderSignupForm);
router.post('/new', userController.signup, auth.isGuest);
router.get('/users', userController.signup);

router.post('/users', userController.signup);
router.get('/login', auth.isGuest, userController.renderLoginForm);
router.post('/login', auth.isGuest, userController.login);

// Logged-in-only routes
router.get('/profile', auth.isLoggedIn, userController.viewProfile);
router.get('/logout', auth.isLoggedIn, userController.logout);

router.get('/:id', userController.viewSellerProfile); // New route
router.post('/:id/reviews', auth.isLoggedIn, userController.addReview);


module.exports = router;
