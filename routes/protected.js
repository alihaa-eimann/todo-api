const express = require('express');
const router = express.Router();

router.get('/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }
  res.status(200).json({ message: 'Token received (not verified yet)' });
});

module.exports = router;