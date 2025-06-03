const mongoose = require('mongoose');

const OrderPartSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  }
});

const OrderItemSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  parts: [OrderPartSchema],
  totalPrice: {
    type: Number,
    required: true
  }
});

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  items: [OrderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'in_process', 'shipped', 'completed', 'closed'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  notes: String,
  barcode: String,
  deviceLeft: {
    type: Boolean,
    default: false
  },
  sentToCentralService: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);