const pool = require('../db');

class Post {
  static async create(title, content, createdBy, mediaUrl = null) {
    const result = await pool.query(
      'INSERT INTO posts (title, content, created_by, media_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, createdBy, mediaUrl]
    );
    return result.rows[0];
  }

  static async findAll() {
    const result = await pool.query('SELECT * FROM posts');
    return result.rows;
  }
}

module.exports = Post;
