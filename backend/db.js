
require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI;
console.log('mongoURI:', mongoURI);

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
  }
};

module.exports = connectToMongo;