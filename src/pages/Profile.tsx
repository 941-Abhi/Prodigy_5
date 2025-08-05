import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import Post from '../components/Post';
import { User, Post as PostType } from '../types';
import { mockDataService } from '../services/mockData';

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        const [userData, postsData, usersData] = await Promise.all([
          mockDataService.getUserById(userId),
          mockDataService.getPostsByUser(userId),
          mockDataService.getUsers()
        ]);

        if (!userData) {
          setError('User not found');
          return;
        }

        setUser(userData);
        setPosts(postsData);
        setUsers(usersData);
      } catch (error) {
        setError('Failed to load profile');
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const getUserById = (userId: string): User | undefined => {
    return users.find(user => user.id === userId);
  };

  const handlePostUpdate = () => {
    // Refresh posts when a post is updated
    if (userId) {
      mockDataService.getPostsByUser(userId).then(setPosts);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container">
        <div className="error">{error || 'User not found'}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="profile-header">
        <div className="profile-info">
          <img src={user.avatar} alt={user.displayName} className="profile-avatar" />
          <div className="profile-details">
            <h1>{user.displayName}</h1>
            <div className="profile-username">@{user.username}</div>
            <p className="profile-bio">{user.bio}</p>
            <div className="profile-stats">
              <div className="stat">
                <div className="stat-number">{posts.length}</div>
                <div className="stat-label">Posts</div>
              </div>
              <div className="stat">
                <div className="stat-number">{user.followers.length}</div>
                <div className="stat-label">Followers</div>
              </div>
              <div className="stat">
                <div className="stat-number">{user.following.length}</div>
                <div className="stat-label">Following</div>
              </div>
              <div className="stat">
                <div className="stat-number">
                  {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                </div>
                <div className="stat-label">Member Since</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-header">
        <h2 className="page-title">Posts</h2>
        <p className="page-subtitle">
          {posts.length === 0 
            ? 'No posts yet' 
            : `${posts.length} post${posts.length === 1 ? '' : 's'}`
          }
        </p>
      </div>

      <div className="post-grid">
        {posts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <h3 style={{ marginBottom: '10px' }}>No posts yet</h3>
            <p style={{ color: '#666' }}>
              When {user.displayName} shares something, it will appear here.
            </p>
          </div>
        ) : (
          posts.map(post => {
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

export default Profile; 