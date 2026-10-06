const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');

const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');
const offerRoutes = require('./routes/offerRoutes');
const { seed, DEMO_PASSWORD, demoEmail } = require('./data/seed');

const app = express();

// Set up view engine and static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Sessions live in memory alongside the rest of the demo data.
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'technolab-marketplace-demo-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 } // 1-hour session
  })
);

// Initialize flash after session setup
app.use(flash());

// Middleware to make flash messages and search term available globally
app.use((req, res, next) => {
  res.locals.messages = req.flash();

  res.locals.user = req.session.userId ? { id: req.session.userId } : null;

  res.locals.searchTerm = req.query.q || '';
  next();
});

// Use routes
app.use('/items', itemRoutes);
app.use('/users', userRoutes);
app.use('/offers', offerRoutes);

// Define the home route
app.get('/', (req, res) => {
  res.render('index');
});

// Error handling for 404 - Not Found
app.use((req, res) => {
  res.status(404).render('error', { message: ` 404 Error - The server cannot locate the resource at "${req.originalUrl}"` });
});

// Error handling for other server errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Internal Server Error' });
});

// Load the demo data, then start listening.
seed()
  .then((counts) => {
    console.log(
      `Loaded demo data: ${counts.items} items, ${counts.users} users, `
      + `${counts.offers} offers, ${counts.reviews} reviews`
    );
    console.log(`Demo login: ${demoEmail} / ${DEMO_PASSWORD}`);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error('Failed to load demo data', error);
    process.exit(1);
  });

module.exports = app;
