import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Post from '../components/Post';
import { Post as PostType, User } from '../types';
import { mockDataService } from '../services/mockData';

const Home: React.FC = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsData, usersData] = await Promise.all([
          mockDataService.getPosts(),
          mockDataService.getUsers()
        ]);
        setPosts(postsData);
        setUsers(usersData);
        setFilteredPosts(postsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const searchPosts = async () => {
        try {
          const results = await mockDataService.searchPosts(searchQuery);
          setFilteredPosts(results);
        } catch (error) {
          console.error('Error searching posts:', error);
        }
      };
      searchPosts();
    } else {
      setFilteredPosts(posts);
    }
  }, [searchQuery, posts]);

  const getUserById = (userId: string): User | undefined => {
    return users.find(user => user.id === userId);
  };

  const handlePostUpdate = () => {
    // Refresh posts when a post is updated
    mockDataService.getPosts().then(setPosts);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Home</h1>
        <p className="page-subtitle">Discover what's happening in your network</p>
        
        <div style={{ marginTop: '20px', position: 'relative', maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts and tags..."
            className="form-input"
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </div>

      <div className="post-grid">
        {filteredPosts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <h3 style={{ marginBottom: '10px' }}>No posts found</h3>
            <p style={{ color: '#666' }}>
              {searchQuery ? 'Try adjusting your search terms' : 'Be the first to share something!'}
            </p>
          </div>
        ) : (
          filteredPosts.map(post => {
            const author = getUserById(post.authorId);
            if (!author) return null;
            
            return (
              <Post
                key={post.id}
                post={post}
                author={author}
                onPostUpdate={handlePostUpdate}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default Home; 