const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3005;

app.use(express.json());

// MongoDB connection
const connectMongo = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      await mongoose.connect('mongodb://mongodb:27017/cafe');
      console.log('Customer Service connected to MongoDB');
      break;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      retries--;
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};
connectMongo().catch(console.error);

// Customer Schema
const customerSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: String,
  email: String,
  loyaltyPoints: { type: Number, default: 0 },
});

const Customer = mongoose.model('Customer', customerSchema);

app.post('/customers', async (req, res) => {
  const { name, email } = req.body;
  const customerCount = await Customer.countDocuments();
  const customer = new Customer({ id: customerCount + 1, name, email });
  await customer.save();
  res.status(201).json(customer);
});

app.get('/customers/:id', async (req, res) => {
  const customer = await Customer.findOne({ id: parseInt(req.params.id) });
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
});

app.post('/customers/update-points', async (req, res) => {
  const { customerId, points } = req.body;
  if (!customerId || points == null) {
    return res.status(400).json({ error: 'Customer ID and points required' });
  }

  try {
    const customer = await Customer.findOne({ id: customerId });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    customer.loyaltyPoints += points;
    await customer.save();
    console.log(`Updated loyalty points for customer ${customer.id}: ${customer.loyaltyPoints}`);
    res.status(200).json({ message: 'Loyalty points updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update loyalty points' });
  }
});

app.listen(port, () => {
  console.log(`Customer Service running on port ${port}`);
});