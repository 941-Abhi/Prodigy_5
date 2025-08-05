import { User, Post, Comment } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Mock users
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    displayName: 'John Doe',
    bio: 'Software developer and tech enthusiast',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    followers: ['2', '3'],
    following: ['2', '3'],
    createdAt: new Date('2023-01-15')
  },
  {
    id: '2',
    username: 'jane_smith',
    email: 'jane@example.com',
    displayName: 'Jane Smith',
    bio: 'Digital artist and creative designer',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    followers: ['1', '3'],
    following: ['1'],
    createdAt: new Date('2023-02-20')
  },
  {
    id: '3',
    username: 'mike_wilson',
    email: 'mike@example.com',
    displayName: 'Mike Wilson',
    bio: 'Photography lover and travel blogger',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    followers: ['1', '2'],
    following: ['1', '2'],
    createdAt: new Date('2023-03-10')
  }
];

// Mock posts
export const mockPosts: Post[] = [
  {
    id: '1',
    authorId: '1',
    content: 'Just finished building this amazing social media app! 🚀 The features include user profiles, posts, likes, comments, and media uploads. What do you think? #coding #react #typescript',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop'
    },
    tags: ['coding', 'react', 'typescript'],
    likes: ['2', '3'],
    comments: [
      {
        id: '1',
        postId: '1',
        authorId: '2',
        content: 'This looks amazing! Great work! 👏',
        createdAt: new Date('2024-01-15T10:30:00')
      },
      {
        id: '2',
        postId: '1',
        authorId: '3',
        content: 'The UI is so clean and modern!',
        createdAt: new Date('2024-01-15T11:15:00')
      }
    ],
    createdAt: new Date('2024-01-15T09:00:00')
  },
  {
    id: '2',
    authorId: '2',
    content: 'Working on some new digital art pieces today. The creative process is always so fulfilling! 🎨 #digitalart #creativity',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=400&fit=crop'
    },
    tags: ['digitalart', 'creativity'],
    likes: ['1', '3'],
    comments: [
      {
        id: '3',
        postId: '2',
        authorId: '1',
        content: 'Your art is always so inspiring!',
        createdAt: new Date('2024-01-14T16:20:00')
      }
    ],
    createdAt: new Date('2024-01-14T15:00:00')
  },
  {
    id: '3',
    authorId: '3',
    content: 'Beautiful sunset at the beach today! Nature never fails to amaze me. 🌅 #photography #nature #sunset',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop'
    },
    tags: ['photography', 'nature', 'sunset'],
    likes: ['1', '2'],
    comments: [],
    createdAt: new Date('2024-01-13T18:30:00')
  }
];

// Mock data service
export class MockDataService {
  private users: User[] = [...mockUsers];
  private posts: Post[] = [...mockPosts];

  // User methods
  async getUsers(): Promise<User[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.users]), 500);
    });
  }

  async getUserById(id: string): Promise<User | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = this.users.find(u => u.id === id);
        resolve(user || null);
      }, 300);
    });
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser: User = {
          ...userData,
          id: uuidv4(),
          createdAt: new Date()
        };
        this.users.push(newUser);
        resolve(newUser);
      }, 500);
    });
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userIndex = this.users.findIndex(u => u.id === id);
        if (userIndex !== -1) {
          this.users[userIndex] = { ...this.users[userIndex], ...updates };
          resolve(this.users[userIndex]);
        } else {
          resolve(null);
        }
      }, 400);
    });
  }

  // Post methods
  async getPosts(): Promise<Post[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.posts]), 500);
    });
  }

  async getPostById(id: string): Promise<Post | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const post = this.posts.find(p => p.id === id);
        resolve(post || null);
      }, 300);
    });
  }

  async createPost(postData: Omit<Post, 'id' | 'createdAt'>): Promise<Post> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPost: Post = {
          ...postData,
          id: uuidv4(),
          createdAt: new Date()
        };
        this.posts.unshift(newPost);
        resolve(newPost);
      }, 500);
    });
  }

  async likePost(postId: string, userId: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
          if (!post.likes.includes(userId)) {
            post.likes.push(userId);
          }
        }
        resolve();
      }, 300);
    });
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
          post.likes = post.likes.filter(id => id !== userId);
        }
        resolve();
      }, 300);
    });
  }

  async addComment(postId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newComment: Comment = {
          ...commentData,
          id: uuidv4(),
          createdAt: new Date()
        };
        
        const post = this.posts.find(p => p.id === postId);
        if (post) {
          post.comments.push(newComment);
        }
        
        resolve(newComment);
      }, 400);
    });
  }

  // Search methods
  async searchPosts(query: string): Promise<Post[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredPosts = this.posts.filter(post => 
          post.content.toLowerCase().includes(query.toLowerCase()) ||
          post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
        resolve(filteredPosts);
      }, 300);
    });
  }

  async getPostsByUser(userId: string): Promise<Post[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userPosts = this.posts.filter(post => post.authorId === userId);
        resolve(userPosts);
      }, 300);
    });
  }
}

export const mockDataService = new MockDataService(); 