const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAdmin,
} = require('./verifyToken');
const argon2 = require('argon2');
const User = require('../models/User');

const router = require('express').Router();

router.get('/find/:id', verifyTokenAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;

    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/', verifyTokenAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const users = query ? await User.find().sort({_id}).limit(5) : await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put('/:id', verifyTokenAndAuthorization, async (req, res) => {
  if (req.body.poassword) {
    const hashedPassword = await argon2.hash(req.body.password);
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/:id', verifyTokenAndAuthorization, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("L'utilisateur a bien été supprimé");
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/stats", verifyTokenAdmin, async (req, res) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
  
    try {
      const data = await User.aggregate([
        { $match: { createdAt: { $gte: lastYear } } },
        {
          $project: {
            month: { $month: "$createdAt" },
          },
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: 1 },
          },
        },
      ]);
      res.status(200).json(data)
    } catch (err) {
      res.status(500).json(err);
    }
  });

module.exports = router;
