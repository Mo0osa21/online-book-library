const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String },
  isAvailable: { type: Boolean, default: true },
  review: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
})

const Book = mongoose.model('Book', bookSchema)
module.exports = Book
