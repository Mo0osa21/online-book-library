const router = require('express').Router()
const User = require('../models/user')
const Review = require('../models/review')
const Book = require('../models/book')
const isAdmin = require('../middleware/is-admin')
const upload = require('../middleware/upload');


router.get('/', async (req, res) => {
  try {
    const populatedBooks = await Book.find()
    res.render('books/index.ejs', {
      books: populatedBooks
    })
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
})

router.get('/new', isAdmin, async (req, res) => {
  res.render('books/new.ejs')
})




router.post('/',upload.fields([{ name: 'photo' }, { name: 'pdfFile' }]), async (req, res) => {

  try {
    const { title, author, description, genre, isAvailable } = req.body

    const newBook = new Book({
      title,
      author,
      description,
      genre,
      isAvailable: isAvailable === 'on',
      photo: req.files.photo[0].path, 
      pdfFile: req.files.pdfFile[0].path, 
    })

    await newBook.save()

    res.redirect('/books')
  } catch (error) {
    console.error('Error adding book:', error)
    res.status(500).send('An error occurred while adding the book.')
  }
})


router.get('/:bookId', async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    const reviews = await Review.find({ book: book._id }).populate('user', 'username');
    res.render('books/show.ejs', { book, reviews });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

router.get('/:bookId/edit', isAdmin, async (req, res) => {
  try {
    const currentBook = await Book.findById(req.params.bookId)
    res.render('books/edit.ejs', {
      book: currentBook
    })
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
})

router.put('/:bookId', async (req, res) => {
  try {
    const currentBook = await Book.findById(req.params.bookId);

    if (!currentBook) {
      return res.status(404).send('Book not found');
    }

    if (req.body.title !== undefined) currentBook.title = req.body.title;
    if (req.body.author !== undefined) currentBook.author = req.body.author;
    if (req.body.isAvailable !== undefined) {
      currentBook.isAvailable = req.body.isAvailable === 'on'; 
    }else{
      currentBook.isAvailable = false;
    }

    await currentBook.save();

    res.redirect('/books');
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
});

router.delete('/:bookId', isAdmin, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId)
      await Book.deleteOne()
      res.redirect('/books')
  } catch (error) {
    console.error(error)
    res.redirect('/')
  }
})

module.exports = router
