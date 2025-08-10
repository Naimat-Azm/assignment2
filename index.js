require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// MongoDB connection using environment variables
const {
  MONGO_INITDB_ROOT_USERNAME,
  MONGO_INITDB_ROOT_PASSWORD,
  MONGO_HOST,
  MONGO_PORT,
  MONGO_DB
} = process.env;

const mongoURI = `mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));

// Root route returns JSON based on MongoDB connection status
app.get('/', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    // 1 = connected
    res.json({ message: 'Backend is running and connected to MongoDB!' });
  } else {
    res.status(500).json({ message: 'Backend is running but NOT connected to MongoDB.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});