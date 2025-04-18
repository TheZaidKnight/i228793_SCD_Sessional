const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3004;

app.use(express.json());

// MongoDB connection
const connectMongo = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      await mongoose.connect('mongodb://mongodb:27017/cafe');
      console.log('Inventory Service connected to MongoDB');
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

// Menu Item Schema
const menuItemSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: String,
  price: Number,
  stock: Number,
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

app.get('/inventory', async (req, res) => {
  const items = await MenuItem.find();
  res.json(items.map(i => ({ id: i.id, name: i.name, stock: i.stock })));
});

app.post('/inventory/update', async (req, res) => {
  const { items } = req.body; // items: [{ menuItemId, quantity }]
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid items' });
  }

  try {
    for (const item of items) {
      const menuItem = await MenuItem.findOne({ id: item.menuItemId });
      if (!menuItem) {
        return res.status(400).json({ error: `Menu item ${item.menuItemId} not found` });
      }
      if (menuItem.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${menuItem.name}` });
      }
      menuItem.stock -= item.quantity;
      await menuItem.save();
      console.log(`Updated stock for ${menuItem.name}: ${menuItem.stock}`);
    }
    res.status(200).json({ message: 'Inventory updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update inventory' });
  }
});

app.listen(port, () => {
  console.log(`Inventory Service running on port ${port}`);
});