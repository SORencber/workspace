const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('./middleware/auth');

// Create a new order
router.post('/', auth, async (req, res) => {
  try {
    const { order } = req.body;

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'Order data is required'
      });
    }

    // Generate a unique order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${String(orderCount + 1).padStart(4, '0')}`;

    // Generate a barcode (simple implementation)
    const barcode = Date.now().toString().substring(0, 12);

    const newOrder = new Order({
      ...order,
      orderNumber,
      barcode,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      data: { order: newOrder }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update an existing order
router.put('/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { order } = req.body;

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'Order data is required'
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { ...order, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { order: updatedOrder }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get order details
router.get('/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { order }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all orders for a branch
router.get('/', auth, async (req, res) => {
  try {
    const { branchId } = req.query;

    if (!branchId) {
      return res.status(400).json({
        success: false,
        message: 'Branch ID is required'
      });
    }

    const orders = await Order.find({ branchId });

    res.status(200).json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get orders by barcode
router.get('/barcode/:barcode', auth, async (req, res) => {
  try {
    const { barcode } = req.params;

    if (!barcode) {
      return res.status(400).json({
        success: false,
        message: 'Barcode is required'
      });
    }

    // Find orders either by barcode or order number
    const orders = await Order.find({
      $or: [
        { barcode },
        { orderNumber: barcode }
      ]
    });

    res.status(200).json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;