const router = require('express').Router()
const User = require('../models/user')
const Review = require('../models/review')
const Book = require('../models/book')

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

router.get('/new', async (req, res) => {
  res.render('books/new.ejs')
})

router.post('/', async (req, res) => {
  try {
    const { title, author, description, genre, isAvailable } = req.body

    const newBook = new Book({
      title,
      author,
      description,
      genre,
      isAvailable: isAvailable === 'on'
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
    const populatedBook = await Book.findById(req.params.bookId)

    res.render('books/show.ejs', {
      book: populatedBook
    })
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
})

router.get('/:bookId/edit', async (req, res) => {
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
    const currentBook = await Book.findById(req.params.bookId)

      await currentBook.updateOne(req.body)
      res.redirect('/books')

  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
})

router.delete('/:bookId', async (req, res) => {
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
