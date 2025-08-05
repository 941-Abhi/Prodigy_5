import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'social_media_app',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Database service class
export class DatabaseService {
  private pool: mysql.Pool;

  constructor() {
    this.pool = pool;
  }

  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      const connection = await this.pool.getConnection();
      console.log('Database connected successfully!');
      connection.release();
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

  // Initialize database tables
  async initializeTables(): Promise<void> {
    try {
      const connection = await this.pool.getConnection();
      
      // Create users table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          display_name VARCHAR(100) NOT NULL,
          bio TEXT,
          avatar VARCHAR(500),
          followers JSON,
          following JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Create posts table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS posts (
          id VARCHAR(36) PRIMARY KEY,
          author_id VARCHAR(36) NOT NULL,
          content TEXT NOT NULL,
          media_url VARCHAR(500),
          media_type ENUM('image', 'video'),
          tags JSON,
          likes JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Create comments table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS comments (
          id VARCHAR(36) PRIMARY KEY,
          post_id VARCHAR(36) NOT NULL,
          author_id VARCHAR(36) NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
          FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      connection.release();
      console.log('Database tables initialized successfully!');
    } catch (error) {
      console.error('Error initializing database tables:', error);
      throw error;
    }
  }

  // User operations
  async createUser(userData: {
    id: string;
    username: string;
    email: string;
    password: string;
    displayName: string;
    bio?: string;
    avatar?: string;
  }): Promise<any> {
    try {
      const connection = await this.pool.getConnection();
      const [result] = await connection.execute(
        `INSERT INTO users (id, username, email, password, display_name, bio, avatar, followers, following) 
         VALUES (?, ?, ?, ?, ?, ?, ?, '[]', '[]')`,
        [userData.id, userData.username, userData.email, userData.password, userData.displayName, userData.bio || '', userData.avatar || '']
      );
      connection.release();
      return result;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<any> {
    try {
      const connection = await this.pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      connection.release();
      return (rows as any[])[0] || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<any> {
    try {
      const connection = await this.pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      connection.release();
      return (rows as any[])[0] || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<any[]> {
    try {
      const connection = await this.pool.getConnection();
      const [rows] = await connection.execute('SELECT * FROM users ORDER BY created_at DESC');
      connection.release();
      return rows as any[];
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Post operations
  async createPost(postData: {
    id: string;
    authorId: string;
    content: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    tags?: string[];
  }): Promise<any> {
    try {
      const connection = await this.pool.getConnection();
      const [result] = await connection.execute(
        `INSERT INTO posts (id, author_id, content, media_url, media_type, tags, likes) 
         VALUES (?, ?, ?, ?, ?, ?, '[]')`,
        [
          postData.id,
          postData.authorId,
          postData.content,
          postData.mediaUrl || null,
          postData.mediaType || null,
          JSON.stringify(postData.tags || [])
        ]
      );
      connection.release();
      return result;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async getPostById(id: string): Promise<any> {
    try {
      const connection = await this.pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT * FROM posts WHERE id = ?',
        [id]
      );
      connection.release();
      return (rows as any[])[0] || null;
    } catch (error) {
      console.error('Error getting post by ID:', error);
      throw error;
    }
  }

  async getAllPosts(): Promise<any[]> {
    try {
      const connection = await this.pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT * FROM posts ORDER BY created_at DESC'
      );
      connection.release();
      return rows as any[];
    } catch (error) {
      console.error('Error getting all posts:', error);
      throw error;
    }
  }

  async getPostsByUser(userId: string): Promise<any[]> {
    try {
      const connection = await this.pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT * FROM posts WHERE author_id = ? ORDER BY created_at DESC',
        [userId]
      );
      connection.release();
      return rows as any[];
    } catch (error) {
      console.error('Error getting posts by user:', error);
      throw error;
    }
  }

  async likePost(postId: string, userId: string): Promise<void> {
    try {
      const connection = await this.pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT likes FROM posts WHERE id = ?',
        [postId]
      );
      
      const post = (rows as any[])[0];
      if (post) {
        const likes = JSON.parse(post.likes || '[]');
        if (!likes.includes(userId)) {
          likes.push(userId);
          await connection.execute(
            'UPDATE posts SET likes = ? WHERE id = ?',
            [JSON.stringify(likes), postId]
          );
        }
      }
      connection.release();
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    try {
      const connection = await this.pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT likes FROM posts WHERE id = ?',
        [postId]
      );
      
      const post = (rows as any[])[0];
      if (post) {
        const likes = JSON.parse(post.likes || '[]');
        const updatedLikes = likes.filter((id: string) => id !== userId);
        await connection.execute(
          'UPDATE posts SET likes = ? WHERE id = ?',
          [JSON.stringify(updatedLikes), postId]
        );
      }
      connection.release();
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  }

  // Comment operations
  async addComment(commentData: {
    id: string;
    postId: string;
    authorId: string;
    content: string;
  }): Promise<any> {
    try {
      const connection = await this.pool.getConnection();
      const [result] = await connection.execute(
        'INSERT INTO comments (id, post_id, author_id, content) VALUES (?, ?, ?, ?)',
        [commentData.id, commentData.postId, commentData.authorId, commentData.content]
      );
      connection.release();
      return result;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  async getCommentsByPost(postId: string): Promise<any[]> {
    try {
      const connection = await this.pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC',
        [postId]
      );
      connection.release();
      return rows as any[];
    } catch (error) {
      console.error('Error getting comments by post:', error);
      throw error;
    }
  }

  // Search operations
  async searchPosts(query: string): Promise<any[]> {
    try {
      const connection = await this.pool.getConnection();
      const [rows] = await connection.execute(
        'SELECT * FROM posts WHERE content LIKE ? ORDER BY created_at DESC',
        [`%${query}%`]
      );
      connection.release();
      return rows as any[];
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  }

  // Close database connection
  async closeConnection(): Promise<void> {
    await this.pool.end();
  }
}

// Create and export database service instance
export const databaseService = new DatabaseService(); 