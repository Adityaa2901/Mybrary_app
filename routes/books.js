const express = require('express');
const router = express.Router();
const Book = require('../model/book');
const Author = require('../model/author');
const path = require('path');
const fs = require('fs').promises;
const uploadPath = path.join('public', Book.coverImageBasePath);
// console.log(uploadPath);
const multer = require('multer');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype));
  },
});

// All books route
router.get('/', async (req, res) => {
  let query = Book.find();
  if (req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'));
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
    query = query.lte('publishDate', req.query.publishedBefore);
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
    query = query.gte('publishDate', req.query.publishedAfter);
  }

  try {
    const books = await query.exec();
    res.render('books/index', {
      books: books,
      searchOptions: req.query,
    });
  } catch {
    res.redirect('/');
  }
});
// new book route for just displaying the form for creation of a book
router.get('/new', async (req, res) => {
  renderNewPage(res, new Book());
});

// create book route
router.post('/', upload.single('cover'), async (req, res) => {
  const filename = req.file != null ? req.file.filename : null;
  console.log(filename);
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    coverImageName: filename,
    description: req.body.descripton,
  });
  // console.log(book);
  try {
    const newBook = await book.save();
    // res.redirect(`/books/${newBook.id}`);
    res.redirect('/books');
  } catch (e) {
    // console.log(e.message);
    if (book.coverImageName != null) {
      try {
        removeBookCover(book.coverImageName);
      } catch (e) {
        console.error(e);
      }
    }
    renderNewPage(res, book, true);
  }
});

async function removeBookCover(filename) {
  await fs.unlink(path.join(uploadPath, filename));
}

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    if (hasError) {
      params.errorMessage = 'Error creating books';
    }
    res.render('books/new', params);
  } catch (e) {
    console.log(e);
    res.redirect('/books');
  }
}
module.exports = router;

/*
{
    fieldname: 'files',
    originalname: 'Aditya_resume.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    destination: 'uploads/',
    filename: 'b231230851438191970f06cfc2077246',
    path: 'uploads\\b231230851438191970f06cfc2077246',
    size: 134051
  }
    */
