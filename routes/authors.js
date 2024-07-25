const express = require('express');
const router = express.Router();
const Author = require('../model/author');
// All author route
router.get('/', async (req, res) => {
  let searchOptions = {};
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i');
  }
  try {
    const authors = await Author.find(searchOptions);
    // console.log(req.query);
    res.render('authors/index', { authors: authors, searchOptions: req.query });
  } catch {
    res.redirect('/');
  }
});
// new author route for just displaying the form for creation for a author
router.get('/new', (req, res) => {
  res.render('authors/new', { author: new Author() });
});

// creat3e author route
router.post('/', async (req, res) => {
  const author = new Author({
    name: req.body.name,
  });
  try {
    const newUser = await author.save();
    // res.redirect(`authors/${newUser.id}`);
    res.redirect('authors');
  } catch (e) {
    res.render('authors/new', {
      author: author,
      errorMessage: `Error creating author⚠️`,
    });
  }
});

module.exports = router;
