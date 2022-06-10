const router = require('express').Router();
const {
  verifyTokenAdmin, verifyToken, verifyTokenAndAuthorization,
} = require('./verifyToken');
const Order = require('../models/Order');

router.post('/', verifyToken, async (req, res) => {
  const newOrder = new Order(req.body);
  try {
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put('/:id', verifyTokenAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/find/:userId', verifyTokenAndAuthorization, async (req, res) => {
  try {
    const orders = await Order.find({userId : req.params.userId});

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/',verifyTokenAdmin, async (req, res) => {

  try {
     const orders = await Order.find()
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/:id', verifyTokenAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json('La commande a bien été supprimé');
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/income", verifyTokenAdmin, async (req, res) => {
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const Month = new Date(new Date().setMonth(lastMonth.getMonth() -1 ));
  
    try {
      const income  = await Order.aggregate([
        { $match: { createdAt: { $gte: Month } } },
        {
          $project: {
            month: { $month: "$createdAt" },
            sales: "$amount"
          },
        },
        {
          $group: {
            _id: "$month",
            total: { $sum: "$sales" },
          },
        },
      ]);
      res.status(200).json(income)
    } catch (err) {
      res.status(500).json(err);
    }
})


module.exports = router
