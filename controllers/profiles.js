const router = require('express').Router()
const bcrypt = require('bcrypt')

const User = require('../models/user')
const upload = require('../middleware/upload')

router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id)
    res.render('profile/index.ejs', { user })
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
})
router.get('/edit', async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id)
    res.render('profile/edit.ejs', { user })
  } catch (error) {
    console.log(error)
    res.redirect('/')
  }
})

router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body
    let updatedData = { username }

    if (password !== confirmPassword) {
      return res.send('Password and Confirm Password must match.')
    }

    // If a new password is provided, hash it before saving
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      updatedData.password = hashedPassword
    }

    // If a new photo is uploaded, save its path
    if (req.file) {
      updatedData.photo = req.file.path // Save the file path of the uploaded photo
    }

    const user = await User.findByIdAndUpdate(
      req.session.user._id,
      updatedData,
      { new: true }
    )

    // Update the session with the updated user data
    req.session.user = user

    res.redirect('/profile') // Redirect to the profile page
  } catch (error) {
    console.log(error)
    res.redirect('/') // If error occurs, redirect to home page
  }
})
module.exports = router
