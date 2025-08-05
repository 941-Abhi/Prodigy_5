import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Heart, MessageCircle, Share } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Post as PostType, User } from '../types';
import { mockDataService } from '../services/mockData';

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<PostType | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!postId) return;

      try {
        const [postData, usersData] = await Promise.all([
          mockDataService.getPostById(postId),
          mockDataService.getUsers()
        ]);

        if (!postData) {
          setError('Post not found');
          return;
        }

        const postAuthor = usersData.find(user => user.id === postData.authorId);
        if (!postAuthor) {
          setError('Author not found');
          return;
        }

        setPost(postData);
        setAuthor(postAuthor);
        setUsers(usersData);
        setIsLiked(postData.likes.includes(currentUser?.id || ''));
        setLikeCount(postData.likes.length);
      } catch (error) {
        setError('Failed to load post');
        console.error('Error fetching post data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId, currentUser]);

  const handleLike = async () => {
    if (!currentUser || !post) return;

    try {
      if (isLiked) {
        await mockDataService.unlikePost(post.id, currentUser.id);
        setLikeCount(prev => prev - 1);
      } else {
        await mockDataService.likePost(post.id, currentUser.id);
        setLikeCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
      
      // Refresh post data
      const updatedPost = await mockDataService.getPostById(post.id);
      if (updatedPost) {
        setPost(updatedPost);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !post || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await mockDataService.addComment(post.id, {
        postId: post.id,
        authorId: currentUser.id,
        content: newComment.trim()
      });
      setNewComment('');
      
      // Refresh post data
      const updatedPost = await mockDataService.getPostById(post.id);
      if (updatedPost) {
        setPost(updatedPost);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserById = (userId: string): User | undefined => {
    return users.find(user => user.id === userId);
  };

  const extractTags = (content: string) => {
    const tagRegex = /#(\w+)/g;
    const tags = content.match(tagRegex)?.map(tag => tag.slice(1)) || [];
    return tags;
  };

  const renderContent = (content: string) => {
    const tags = extractTags(content);
    let processedContent = content;

    tags.forEach(tag => {
      const regex = new RegExp(`#${tag}`, 'g');
      processedContent = processedContent.replace(regex, `<span class="tag">#${tag}</span>`);
    });

    return processedContent;
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading post...</div>
      </div>
    );
  }

  if (error || !post || !author) {
    return (
      <div className="container">
        <div className="error">{error || 'Post not found'}</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '50px auto' }}>
      <div className="page-header">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <h1 className="page-title">Post Details</h1>
      </div>

      <div className="post-card" style={{ marginBottom: '30px' }}>
        <div className="post-header">
          <img src={author.avatar} alt={author.displayName} className="avatar" />
          <div className="post-author">
            <div className="post-author-name">{author.displayName}</div>
            <div className="post-time">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>

        <div className="post-content">
          <div
            className="post-text"
            dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
          />

          {post.media && (
            <div className="post-media">
              {post.media.type === 'image' ? (
                <img src={post.media.url} alt="Post media" className="post-image" />
              ) : (
                <video controls className="post-image">
                  <source src={post.media.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}

          {post.tags.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              {post.tags.map(tag => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        <div className="post-actions">
          <button
            onClick={handleLike}
            className={`post-action ${isLiked ? 'liked' : ''}`}
          >
            <Heart size={16} fill={isLiked ? '#e74c3c' : 'none'} />
            {likeCount} {likeCount === 1 ? 'like' : 'likes'}
          </button>

          <button className="post-action">
            <MessageCircle size={16} />
            {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
          </button>

          <button className="post-action">
            <Share size={16} />
            Share
          </button>
        </div>
      </div>

      <div className="comments-section">
        <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>Comments</h3>
        
        {post.comments.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
            <h4 style={{ marginBottom: '10px', color: '#666' }}>No comments yet</h4>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <div style={{ marginBottom: '30px' }}>
            {post.comments.map(comment => {
              const commentAuthor = getUserById(comment.authorId);
              return (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={commentAuthor?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face'}
                        alt={commentAuthor?.displayName || 'User'}
                        className="avatar"
                        style={{ width: '32px', height: '32px' }}
                      />
                      <span className="comment-author">
                        {commentAuthor?.displayName || 'Unknown User'}
                      </span>
                    </div>
                    <span className="comment-time">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="comment-content">{comment.content}</div>
                </div>
              );
            })}
          </div>
        )}

        <form onSubmit={handleComment} className="comment-form">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="form-input textarea"
                rows={3}
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostDetail; 