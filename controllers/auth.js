const router = require('express').Router();
const bcrypt = require('bcrypt');
const multer = require('multer');
const User = require('../models/user');
const path = require('path');
// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});
const upload = multer({ storage });
// Render Sign-Up Page
router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up.ejs');
});
// Handle Sign-Up Logic with Photo Upload
router.post('/sign-up', upload.single('photo'), async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;
    // Validate input fields
    if (!username || !password || !confirmPassword || !req.file) {
      return res.send('All fields, including photo, are required.');
    }
    // Check if username is already taken
    const userInDatabase = await User.findOne({ username });
    if (userInDatabase) {
      return res.send('Username already taken.');
    }
    // Check if passwords match
    if (password !== confirmPassword) {
      return res.send('Password and Confirm Password must match.');
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create the user with the photo path
    const newUser = new User({
      username,
      password: hashedPassword,
      photo: req.file.path, // Save the photo path
    });
    await newUser.save();
    res.send(`Thanks for signing up, ${newUser.username}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong. Please try again.');
  }
});
// Render Sign-In Page
router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in.ejs');
});
// Handle Sign-In Logic
router.post('/sign-in', async (req, res) => {
  try {
    const { username, password } = req.body;
    // Validate input fields
    if (!username || !password) {
      return res.send('Both username and password are required.');
    }
    // Find user in the database
    const userInDatabase = await User.findOne({ username });
    if (!userInDatabase) {
      return res.send('Invalid username or password. Please try again.');
    }
    // Check if the password matches
    const validPassword = await bcrypt.compare(password, userInDatabase.password);
    if (!validPassword) {
      return res.send('Invalid username or password. Please try again.');
    }
    // Save user data in session
    req.session.user = {
      username: userInDatabase.username,
      _id: userInDatabase._id,
      photo: userInDatabase.photo, // Include photo in session
    };
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong. Please try again.');
  }
});
// Handle Sign-Out Logic
router.get('/sign-out', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Failed to sign out. Please try again.');
    }
    res.redirect('/');
  });
});
module.exports = router;
