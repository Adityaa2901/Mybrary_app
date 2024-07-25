if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const indexRouter = require('./routes/index');
const authorRouter = require('./routes/authors');
const bookRouter = require('./routes/books');
const bodyParser = require('body-parser');
app.set('view engine', 'ejs'); // configuring the express application to use ejs template engine for processing templates.
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout'); // specifying the default layout for templates(for consistent look) to be used by server
app.use(expressLayouts); // it provides layout support for ejs.

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL);

const db = mongoose.connection;
db.on('error', (error) => {
  console.error(error);
});
db.once('open', () => {
  console.log('Connected to mongoose...');
});

app.use('/', indexRouter);
app.use('/authors', authorRouter);
app.use('/books', bookRouter);
app.listen(process.env.PORT || 3000);
