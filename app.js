const express = require('express');
const app = express();
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');
const offerRoutes = require('./routes/offerRoutes');

const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

// Set up view engine and static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');


// Set up session middleware
app.use(
  session({
    secret: '884b17dffd0643bb224bc81905e98b8e7a1d3defd60664d20954c80f116a54eb0f98f575d096f386d3e24b56a1b0919db830ccc5e0085e3c73afba95e03406a3',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: 'mongodb+srv://admin:admin123@cluster0.yabz1.mongodb.net/project5?retryWrites=true&w=majority&appName=Cluster0',
    }),
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

// Connect to MongoDB
const mongUri = 'mongodb+srv://admin:admin123@cluster0.yabz1.mongodb.net/project5?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongUri)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error('Could not connect to MongoDB Atlas', error);
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

