const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const auth = require('./middleware/auth');

// Search customer by multiple fields
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Search by multiple fields
    const customers = await Customer.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { phoneNumber: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { address: { $regex: query, $options: 'i' } }
      ]
    }).limit(10);

    // If searching by orderId, find customers with matching orders
    const orderCustomers = await Order.find({
      $or: [
        { orderNumber: { $regex: query, $options: 'i' } },
        { barcode: { $regex: query, $options: 'i' } }
      ]
    }).distinct('customerId');

    let orderRelatedCustomers = [];
    if (orderCustomers.length > 0) {
      orderRelatedCustomers = await Customer.find({
        _id: { $in: orderCustomers }
      });
    }

    // Combine both results and remove duplicates
    const allCustomers = [...customers];
    orderRelatedCustomers.forEach(customer => {
      if (!allCustomers.some(c => c._id.toString() === customer._id.toString())) {
        allCustomers.push(customer);
      }
    });

    res.status(200).json({
      success: true,
      data: { customers: allCustomers }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Search customer by phone number (keeping for backward compatibility)
router.get('/phone', auth, async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const customer = await Customer.findOne({ phoneNumber: phone });

    res.status(200).json({
      success: true,
      data: { customer }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create or update customer
router.post('/', auth, async (req, res) => {
  try {
    const { customer } = req.body;

    if (!customer) {
      return res.status(400).json({
        success: false,
        message: 'Customer data is required'
      });
    }

    // All fields are now optional as per the schema
    let existingCustomer;
    let isNew = false;

    if (customer._id) {
      // Update existing customer
      existingCustomer = await Customer.findByIdAndUpdate(
        customer._id,
        { ...customer, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );

      if (!existingCustomer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }
    } else {
      // Create new customer
      isNew = true;
      existingCustomer = new Customer(customer);
      await existingCustomer.save();
    }

    res.status(200).json({
      success: true,
      data: {
        customer: existingCustomer,
        isNew
      }
    });
  } catch (error) {
    // Check for validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get customer orders
router.get('/:customerId/orders', auth, async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID is required'
      });
    }

    const orders = await Order.find({ customerId });

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

// Get all customers
router.get('/', auth, async (req, res) => {
  try {
    const customers = await Customer.find();

    res.status(200).json({
      success: true,
      data: { customers }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;