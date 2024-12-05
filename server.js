const express = require('express')
const morgan = require('morgan')
const app = express()
const mongoose = require('mongoose')
require('dotenv').config()
const session = require('express-session')
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const passUserToView = require('./middleware/pass-user-to-view.js')
const methodOverride = require('method-override')
const authCtrl = require('./controllers/auth')
const booksCtrl = require('./controllers/books')
const isSignedIn = require('./middleware/is-signed-in.js')

app.use(express.urlencoded({ extended: false }))

app.use(methodOverride('_method'))

app.use(morgan('dev'))

app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  })
)
app.use(passUserToView)

// Home route
app.get('/', (req, res) => {
  res.render('index.ejs', {
    user: req.session.user
  })
})

app.use('/auth', authCtrl)
app.use(isSignedIn)
app.use('/books', booksCtrl)

mongoose.connect(process.env.MONGODB_URI)
mongoose.connection.on('connected', () => {
  console.log(`Connected to mongoDB ${mongoose.connection.name}`)
})



app.use(bodyParser.urlencoded({ extended: true }));

// Set up Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename the file to avoid duplicates
  }
});

const upload = multer({ storage: storage });

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

app.use('/uploads', express.static('uploads'));
/////////////////////////////////////////////////////////////////////////

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
// app.use(morgan('dev'));


app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

const port = process.env.PORT ? process.env.PORT : '3000';



app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})