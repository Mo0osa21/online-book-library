const router = require('express').Router()
const User = require('../models/user')
const Book = require('../models/book')
const Review = require('../models/review')


router.post('/', async (req, res) => {
  try {
    const { book, content, value } = req.body;
    const review = new Review({
      book,
      user: req.session.user._id,
      content,
      value,
    });
    await review.save();
    res.redirect(`/books/${book}`);
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});


module.exports = router
