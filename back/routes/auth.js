// routes/auth.js

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');  // Assuming this is your user model
const router = express.Router();

// Signup route
router.post('/signup', async (req, res, next) => {
  const { username, email, password } = req.body;

   // Debugging: Log the values being passed
   console.log('Signup Request Data:', { username, email, password });

  // Basic validation for required fields
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if the email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

     // Debugging: Log the hashed password
     console.log('Hashed Password:', hashedPassword);

    // Insert the new user into the database
    const result = await User.create(username, email, hashedPassword);

    // Respond with the created user data
    res.status(201).json({ message: 'User created successfully', user: result });
  } catch (err) {
    next(err); // Pass any errors to the error handler
  }
});

// Login route
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  // Basic validation for required fields
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(403).json({ error: 'Invalid credentials' });
    }

    // Create and return a JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (err) {
    next(err); // Pass any errors to the error handler
  }
});

module.exports = router;
