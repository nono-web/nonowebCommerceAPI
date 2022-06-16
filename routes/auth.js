const router = require('express').Router();
const User = require('../models/User');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const { verifyToken, requireAuth, verifyToken2 } = require('./verifyToken');

router.post('/register', async (req, res) => {
  try {
    const hashedPassword = await argon2.hash(req.body.password);

    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).json('Mauvais pseudo ou Mot de passe');

    const validPassword = await argon2.verify(user.password, req.body.password);
    if (!validPassword)
      return res.status(400).json('Mauvais pseudo ou Mot de passe');

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: '3d' }
    );

    const { password, ...others } = user._doc;
console.log('login',{ ...others, accessToken })
    res.status(200).json({ ...others, accessToken });
    
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.post('/logout', async (req, res) => {

  try {
    let {currentUser} = req.body;
    currentUser = false
    console.log('logout',req.body)
    res
      .clearCookie('access_token')
      .status(200)
      .json(currentUser );
  } catch (err) {}
});

module.exports = router;
