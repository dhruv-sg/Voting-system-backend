const express = require('express');
const app = express();
require('dotenv').config();
const db = require('./db');

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello, world! 🚀');
});

// ⬇️ ROUTES
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes'); // ✅ Add this line

app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes); // ✅ Add this line too

app.listen(PORT, () => {
  console.log(`🚀 App is running at http://localhost:${PORT}`);
});
