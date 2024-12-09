const router = require('express').Router()
const bcrypt = require('bcrypt')

const User = require('../models/user')
const upload = require('../middleware/upload')

router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up.ejs')
})

router.post('/sign-up', upload.single('photo'), async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body

    if (!username || !password || !confirmPassword || !req.file) {
      return res.send('All fields, including photo, are required.')
    }

    const userInDatabase = await User.findOne({ username })
    if (userInDatabase) {
      return res.send('Username already taken.')
    }

    if (password !== confirmPassword) {
      return res.send('Password and Confirm Password must match.')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({
      username,
      password: hashedPassword,
      photo: req.file.path
    })
    await newUser.save()
    res.send(`Thanks for signing up, ${newUser.username}`)
  } catch (error) {
    console.error(error)
    res.status(500).send('Something went wrong. Please try again.')
  }
})

router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in.ejs')
})

router.post('/sign-in', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.send('Both username and password are required.')
    }

    const userInDatabase = await User.findOne({ username })
    if (!userInDatabase) {
      return res.send('Invalid username or password. Please try again.')
    }

    const validPassword = await bcrypt.compare(
      password,
      userInDatabase.password
    )
    if (!validPassword) {
      return res.send('Invalid username or password. Please try again.')
    }

    req.session.user = {
      username: userInDatabase.username,
      _id: userInDatabase._id,
      photo: userInDatabase.photo,
      isAdmin: userInDatabase.isAdmin
    }
    res.redirect('/')
  } catch (error) {
    console.error(error)
    res.status(500).send('Something went wrong. Please try again.')
  }
})

router.get('/sign-out', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Failed to sign out. Please try again.')
    }
    res.redirect('/')
  })
})

module.exports = router
