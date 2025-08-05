# Social Media Application

A modern social media application built with React, TypeScript, and MySQL database.

## Features

- User authentication (login/register)
- User profiles with avatars and bios
- Create and share posts with text, images, and videos
- Like and comment on posts
- Post tagging with hashtags
- Search functionality
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v8.0 or higher)
- npm or yarn

## Database Setup

### 1. Install MySQL Server

Download and install MySQL Server from the official website: https://dev.mysql.com/downloads/mysql/

### 2. Create Database

Connect to MySQL and create the database:

```sql
CREATE DATABASE social_media_app;
```

### 3. Configure Database Connection

You can set the following environment variables to configure the database connection:

- `DB_HOST` - MySQL host (default: localhost)
- `DB_USER` - MySQL username (default: root)
- `DB_PASSWORD` - MySQL password (default: empty)
- `DB_NAME` - Database name (default: social_media_app)
- `DB_PORT` - MySQL port (default: 3306)

### 4. Initialize Database Tables

Run the database initialization script:

```bash
npm run init-db
```

This will create all necessary tables:
- `users` - User accounts and profiles
- `posts` - User posts with content, media, and likes
- `comments` - Comments on posts

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd project
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database (see Database Setup section above)

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run init-db` - Initialize database tables

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx     # Navigation bar
│   └── Post.tsx       # Post component
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── pages/             # Page components
│   ├── Home.tsx       # Home feed
│   ├── Login.tsx      # Login page
│   ├── Register.tsx   # Registration page
│   ├── Profile.tsx    # User profile page
│   ├── CreatePost.tsx # Create post page
│   └── PostDetail.tsx # Post detail page
├── services/          # Data services
│   ├── mockData.ts    # Mock data service
│   └── database.ts    # MySQL database service
├── types/             # TypeScript type definitions
│   └── index.ts       # Type definitions
├── config/            # Configuration files
│   └── database.ts    # Database configuration
├── scripts/           # Utility scripts
│   └── initDatabase.ts # Database initialization
├── App.tsx            # Main app component
├── main.tsx           # App entry point
└── index.css          # Global styles
```

## Database Schema

### Users Table
- `id` - Unique user ID
- `username` - Unique username
- `email` - Unique email address
- `password` - Hashed password
- `display_name` - User's display name
- `bio` - User biography
- `avatar` - Profile picture URL
- `followers` - JSON array of follower IDs
- `following` - JSON array of following IDs
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### Posts Table
- `id` - Unique post ID
- `author_id` - Foreign key to users table
- `content` - Post text content
- `media_url` - Media file URL (optional)
- `media_type` - Type of media (image/video)
- `tags` - JSON array of hashtags
- `likes` - JSON array of user IDs who liked
- `created_at` - Post creation timestamp
- `updated_at` - Last update timestamp

### Comments Table
- `id` - Unique comment ID
- `post_id` - Foreign key to posts table
- `author_id` - Foreign key to users table
- `content` - Comment text
- `created_at` - Comment creation timestamp
- `updated_at` - Last update timestamp

## Troubleshooting

### Database Connection Issues

1. Make sure MySQL server is running
2. Verify database credentials
3. Check if the database exists
4. Ensure the user has proper permissions

### Common Errors

- **"Access denied"** - Check username and password
- **"Database doesn't exist"** - Create the database first
- **"Connection refused"** - Make sure MySQL is running on the correct port

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 