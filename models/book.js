const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  photo:{ type: String, default:null },
  review: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
})

const Book = mongoose.model('Book', bookSchema)
module.exports = Book
