const express = require('express');
const path = require('path');
const Developer = require(path.join(__dirname, '..', 'models', 'developers'));

// const Developer = require('../models/developers');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });  

function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
}


router.get('/', async (req, res) => {
    try {
        const city = req.session.city;
        let suggestions = [];
        if (city) {
            suggestions = await Developer.find({ city }).limit(5);
        }
        res.render('home', { user: req.session.user || null, suggestions });
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(500).send('Internal server error.');
    }
});


router.get('/register', (req, res) => res.render('register'));

router.post('/register', upload.array('files'), async (req, res) => {
  try {
    const { name, registrationCode, dob, city, degree, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const files = req.files.map(file => file.path);

    const developer = new Developer({ name, registrationCode, dob, city, degree, password: hashedPassword, files });
    await developer.save();
    res.redirect('/login');
  } catch (error) {
    res.status(400).send('Error registering. Try again.');
  }
});

router.get('/login', (req, res) => res.render('login'));

router.post('/login', async (req, res) => {
  const { registrationCode, password } = req.body;
  const developer = await Developer.findOne({ registrationCode });
  
  if (developer && await bcrypt.compare(password, developer.password)) {
    req.session.userId = developer._id;
    req.session.city = developer.city;
    req.session.user = developer;
    res.redirect('/');
  } else {
    res.status(400).send('Invalid credentials');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

router.get('/developers', isAuthenticated, async (req, res) => {
  const developers = await Developer.find();
  res.render('developers', { developers });
});

router.get('/developer/:id', isAuthenticated, async (req, res) => {
  const developer = await Developer.findById(req.params.id);
  res.render('developer', { developer });
});

router.post('/developer/:id', isAuthenticated, async (req, res) => {
  const { name, registrationCode, dob, city, degree } = req.body;
  await Developer.findByIdAndUpdate(req.params.id, { name, registrationCode, dob, city, degree });
  res.redirect('/developers');
});

router.get('/developer/delete/:id', isAuthenticated, async (req, res) => {
  await Developer.findByIdAndDelete(req.params.id);
  res.redirect('/developers');
});

module.exports = router;


