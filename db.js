// 
const mongoose = require('mongoose');
require('dotenv').config();

const mongoURL = process.env.MONGO_URL;

if (!mongoURL) {
  console.error(" MONGO_URL not defined in .env file");
  process.exit(1);
}

mongoose.connect(mongoURL, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected successfully!');
})
.catch((err) => {
  console.error(' MongoDB connection error:', err);
});
//databse

module.exports = mongoose.connection;
