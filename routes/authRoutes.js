const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register route
router.post('/register', async (req, res) => {
  try {
    console.log('=== REGISTER REQUEST ===');
    console.log('Body:', req.body);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    const { name, email, password } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      console.log('Validation failed: missing fields');
      return res.status(400).json({ message: 'Please provide all fields' });
    }
    
    // Check if user exists
    console.log('Checking if user exists for email:', email);
    const userExists = await User.findOne({ email });
    console.log('User exists check result:', userExists);
    
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Password hashed');
    
    // Create user
    console.log('Creating user in database...');
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });
    console.log('User created:', user._id);
    
    // Create token
    console.log('Creating JWT token...');
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'fallback-secret-for-debugging',
      { expiresIn: '30d' }
    );
    console.log('Token created');
    
    console.log('=== REGISTRATION SUCCESS ===');
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('=== REGISTRATION ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    console.log('=== LOGIN REQUEST ===');
    console.log('Body:', req.body);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      console.log('Validation failed: missing email or password');
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Check for user
    console.log('Finding user for email:', email);
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    console.log('Comparing password...');
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    console.log('Password correct:', isPasswordCorrect);
    
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create token
    console.log('Creating JWT token...');
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'fallback-secret-for-debugging',
      { expiresIn: '30d' }
    );
    console.log('Token created');
    
    console.log('=== LOGIN SUCCESS ===');
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('=== LOGIN ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Server error during login',
      error: error.message
    });
  }
});

// Get profile
router.get('/profile', async (req, res) => {
  try {
    console.log('=== PROFILE REQUEST ===');
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Token provided:', !!token);
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-for-debugging');
    console.log('Token decoded, user ID:', decoded.id);
    
    const user = await User.findById(decoded.id).select('-password');
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
    
  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;