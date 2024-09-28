const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');

// Multer configuration for file uploads
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

// Fetch all posts
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.posts');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error fetching posts' });
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

// Delete a post (only the creator can delete)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body; // Get userId from the request body (in real app, get this from the auth token)

  try {
    // Check if the user is the creator of the post
    const post = await pool.query('SELECT * FROM public.posts WHERE id = $1', [id]);

    if (post.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.rows[0].created_by !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this post' });
    }

    // If the user is the creator, proceed to delete
    await pool.query('DELETE FROM public.posts WHERE id = $1', [id]);
    res.status(200).json({ message: 'Post deleted successfully' });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error deleting post' });
  }
});

// Like a post
router.post('/:id/like', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE public.posts SET likes = likes + 1 WHERE id = $1 RETURNING *',
      [id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error liking post' });
  }
});

// Dislike a post
router.post('/:id/dislike', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE public.posts SET dislikes = dislikes + 1 WHERE id = $1 RETURNING *',
      [id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error disliking post' });
  }
});


module.exports = router;
