import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, Video, Hash, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { mockDataService } from '../services/mockData';

const CreatePost: React.FC = () => {
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const extractTags = (text: string): string[] => {
    const tagRegex = /#(\w+)/g;
    const matches = text.match(tagRegex);
    return matches ? matches.map(tag => tag.slice(1)) : [];
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      setError('Please select an image or video file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setMediaFile(file);
    setMediaType(isImage ? 'image' : 'video');
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaFile) {
      setError('Please add some content or media to your post');
      return;
    }

    if (!currentUser) return;

    setIsSubmitting(true);
    setError('');

    try {
      // In a real app, you would upload the file to a server
      // For demo purposes, we'll use the preview URL
      const mediaUrl = mediaPreview || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop';

      await mockDataService.createPost({
        authorId: currentUser.id,
        content: content.trim(),
        media: mediaFile ? {
          type: mediaType,
          url: mediaUrl
        } : undefined,
        tags: extractTags(content),
        likes: [],
        comments: []
      });

      navigate('/');
    } catch (error) {
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview('');
    setMediaType('image');
  };

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '50px auto' }}>
      <div className="page-header">
        <h1 className="page-title">Create Post</h1>
        <p className="page-subtitle">Share your thoughts with the community</p>
      </div>

      <div className="card">
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">What's on your mind?</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="form-input textarea"
              placeholder="Share your thoughts, ideas, or experiences... Use #hashtags to categorize your post"
              rows={6}
            />
          </div>

          {mediaPreview && (
            <div className="form-group">
              <div style={{ position: 'relative', display: 'inline-block' }}>
                {mediaType === 'image' ? (
                  <img 
                    src={mediaPreview} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                  />
                ) : (
                  <video 
                    controls 
                    style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                  >
                    <source src={mediaPreview} type="video/mp4" />
                  </video>
                )}
                <button
                  type="button"
                  onClick={removeMedia}
                  className="btn btn-danger"
                  style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    right: '10px',
                    padding: '4px 8px',
                    fontSize: '12px'
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Add Media (Optional)</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <label className="btn btn-secondary" style={{ cursor: 'pointer', margin: 0 }}>
                <Image size={16} />
                Add Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMediaChange}
                  style={{ display: 'none' }}
                />
              </label>
              <label className="btn btn-secondary" style={{ cursor: 'pointer', margin: 0 }}>
                <Video size={16} />
                Add Video
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleMediaChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {content && (
            <div className="form-group">
              <label className="form-label">Tags Found:</label>
              <div>
                {extractTags(content).map(tag => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
                {extractTags(content).length === 0 && (
                  <span style={{ color: '#666', fontSize: '14px' }}>
                    No tags found. Use #hashtags in your content to categorize your post.
                  </span>
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || (!content.trim() && !mediaFile)}
            >
              <Send size={16} />
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost; 