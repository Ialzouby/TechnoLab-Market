const express = require('express');
const app = express();
const itemRoutes = require('./routes/itemRoutes');
const mongoose = require('mongoose');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.locals.searchTerm = req.query.q || ''; 
  next();
});

const mongUri = 'mongodb+srv://admin:admin123@cluster0.yabz1.mongodb.net/project3?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(mongUri)
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((error) => console.error('Could not connect to MongoDB Atlas', error));


app.use('/items', itemRoutes);

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/login', (req, res) => {
  res.render('login');
});


app.use((req, res) => {
  res.status(404).render('error', { message: `The server cannot locate the resource at "${req.originalUrl}"` });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

