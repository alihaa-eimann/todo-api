const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

router.get('/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { id, email, created_at } = data.user;
  res.status(200).json({ id, email, created_at });
});

module.exports = router;