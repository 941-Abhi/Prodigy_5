import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share } from 'lucide-react';
import { Post as PostType, User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { mockDataService } from '../services/mockData';

interface PostProps {
  post: PostType;
  author: User;
  onPostUpdate: () => void;
}

const Post: React.FC<PostProps> = ({ post, author, onPostUpdate }) => {
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(post.likes.includes(currentUser?.id || ''));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLike = async () => {
    if (!currentUser) return;

    try {
      if (isLiked) {
        await mockDataService.unlikePost(post.id, currentUser.id);
        setLikeCount(prev => prev - 1);
      } else {
        await mockDataService.likePost(post.id, currentUser.id);
        setLikeCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
      onPostUpdate();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await mockDataService.addComment(post.id, {
        postId: post.id,
        authorId: currentUser.id,
        content: newComment.trim()
      });
      setNewComment('');
      onPostUpdate();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="post-card">
      <div className="post-header">
        <img src={author.avatar} alt={author.displayName} className="avatar" />
        <div className="post-author">
          <Link to={`/profile/${author.id}`} className="post-author-name">
            {author.displayName}
          </Link>
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
          <div style={{ marginTop: '10px' }}>
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

        <button 
          onClick={() => setShowComments(!showComments)}
          className="post-action"
        >
          <MessageCircle size={16} />
          {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
        </button>

        <button className="post-action">
          <Share size={16} />
          Share
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          {post.comments.map(comment => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <span className="comment-author">{comment.authorId}</span>
                <span className="comment-time">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              <div className="comment-content">{comment.content}</div>
            </div>
          ))}

          <form onSubmit={handleComment} className="comment-form">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="comment-input"
              disabled={isSubmitting}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Post; 