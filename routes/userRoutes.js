// const express = require('express');
// const router = express.Router();
// const User = require('./../models/user');
// const { jwtAuthMiddleware, generateToken } = require('./../jwt');

// // POST /signup - Register user
// router.post('/signup', async (req, res) => {
//   try {
//     const data = req.body;
//     const newUser = new User(data);
//     const response = await newUser.save();

//     const payload = {
//       id: response.id,
//     };
//     const token = generateToken(payload);

//     res.status(200).json({ response, token });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // POST /login - User login
// router.post('/login', async (req, res) => {
//   try {
//     const { aadharCardNumber, password } = req.body;

//     const user = await User.findOne({ aadharCardNumber });
//     if (!user || !(await user.comparePassword(password))) {
//       return res.status(401).json({ error: 'Invalid Aadhar number or password' });
//     }

//     const payload = { id: user.id };
//     const token = generateToken(payload);

//     res.json({ token });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // GET /profile - User profile
// router.get('/profile', jwtAuthMiddleware, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const user = await User.findById(userId).select('-password'); // hide password
//     res.status(200).json({ user });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // PUT /profile/password - Change password
// router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { currentPassword, newPassword } = req.body;

//     const user = await User.findById(userId);

//     if (!(await user.comparePassword(currentPassword))) {
//       return res.status(401).json({ error: 'Invalid current password' });
//     }

//     user.password = newPassword;
//     await user.save();

//     res.status(200).json({ message: 'Password updated' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const { jwtAuthMiddleware, generateToken } = require('./../jwt');

// 🔐 POST /signup - Register new user
router.post('/signup', async (req, res) => {
  try {
    const { name, age, address, aadharCardNumber, password, role } = req.body;

    // Basic validation (you can expand this)
    if (!name || !age || !address || !aadharCardNumber || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Default role to "voter" if not provided
    const newUser = new User({
      name,
      age,
      address,
      aadharCardNumber,
      password,
      role: role || 'voter',
    });

    const response = await newUser.save();

    const payload = {
      id: response._id,
    };

    const token = generateToken(payload);

    res.status(201).json({ user: response, token });
  } catch (err) {
    console.error('❌ Signup error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🔑 POST /login - Authenticate user
router.post('/login', async (req, res) => {
  try {
    const { aadharCardNumber, password } = req.body;

    const user = await User.findOne({ aadharCardNumber });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid Aadhar number or password' });
    }

    const payload = { id: user._id };
    const token = generateToken(payload);

    res.status(200).json({ token });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 👤 GET /profile - Get current user's profile
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password'); // Don't send password
    res.status(200).json({ user });
  } catch (err) {
    console.error('❌ Profile fetch error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🔁 PUT /profile/password - Change password
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('❌ Password update error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
