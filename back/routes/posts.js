// routes/posts.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify directory to store files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Create a new post with media upload
router.post('/create', upload.single('media'), async (req, res) => {
  const { title, content, userId } = req.body;
  const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;  // Check if media was uploaded

  try {
    const result = await pool.query(
      'INSERT INTO public.posts (title, content, created_by, media_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, userId, mediaUrl]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error creating post' });
  }
});

// Fetch posts by user
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM public.posts WHERE created_by = $1', [userId]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error fetching posts' });
  }
});

module.exports = router;
