const express = require('express');
const router = express.Router();
const authGuard = require('../middleware/authGuard');

router.get('/profile', authGuard, (req, res) => {
  const { id, email, created_at } = req.user;
  res.status(200).json({ id, email, created_at });
});

router.get('/dashboard', authGuard, (req, res) => {
  res.status(200).json({ message: 'Welcome to your dashboard!', user: req.user.email });
});

module.exports = router;