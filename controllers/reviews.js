const router = require('express').Router()
const User = require('../models/user')
const Book = require('../models/book')
const Review = require('../models/review')

router.get('/:reviewId/edit', async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId)
      .populate('book')
      .populate('user')

    if (review.user._id.toString() !== req.session.user._id.toString()) {
      return res.status(403).send('Unauthorized')
    }

    res.render('books/edit-review.ejs', { review })
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
})

router.post('/', async (req, res) => {
  try {
    const { book, content, value } = req.body
    const review = new Review({
      book,
      user: req.session.user._id,
      content,
      value
    })
    await review.save()
    res.redirect(`/books/${book}`)
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { content, value } = req.body

    const review = await Review.findById(id)
    if (!review) {
      return res.status(404).send('Review not found')
    }
    if (review.user.toString() !== req.session.user._id) {
      return res.status(403).send('Unauthorized')
    }

    review.content = content
    review.value = value
    await review.save()

    res.redirect(`/books/${review.book}`)
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const review = await Review.findById(id)
    if (!review) {
      return res.status(404).send('Review not found')
    }
    if (review.user.toString() !== req.session.user._id) {
      return res.status(403).send('Unauthorized')
    }

    await review.deleteOne()

    res.redirect(`/books/${review.book}`)
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
})

module.exports = router
