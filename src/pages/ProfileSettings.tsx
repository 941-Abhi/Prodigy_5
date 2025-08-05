import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Camera, ArrowLeft, Save, User } from 'lucide-react';
import { mockDataService } from '../services/mockData';

const ProfileSettings: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentUser?.avatar || '');
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please select an image file');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('File size should be less than 5MB');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentUser) return;

    setIsUploading(true);
    setMessage('');

    try {
      // In a real app, you would upload to a server
      // For now, we'll simulate the upload with the preview URL
      const avatarUrl = previewUrl;
      
      // Update user in mock data (in real app, this would be a database update)
      const updatedUser = {
        ...currentUser,
        avatar: avatarUrl
      };

      // Update localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Force re-render by updating auth context
      window.location.reload();
      
      setMessage('Profile picture updated successfully!');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      setMessage('Failed to update profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkip = () => {
    navigate('/');
  };

  if (!currentUser) {
    return (
      <div className="container">
        <div className="error">Please log in to access profile settings.</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '50px auto' }}>
      <div className="page-header">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <h1 className="page-title">Profile Settings</h1>
      </div>

      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Welcome, {currentUser.displayName}!</h2>
          <p style={{ color: '#666' }}>Upload your profile picture to personalize your account</p>
        </div>

        {message && (
          <div className={message.includes('successfully') ? 'success' : 'error'} style={{ marginBottom: '20px' }}>
            {message}
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={previewUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'}
              alt="Profile"
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #e1e5e9'
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Camera size={20} />
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary"
            style={{ marginRight: '10px' }}
          >
            Choose Photo
          </button>
          {selectedFile && (
            <span style={{ fontSize: '14px', color: '#666' }}>
              Selected: {selectedFile.name}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Requirements:</h3>
          <ul style={{ fontSize: '14px', color: '#666', paddingLeft: '20px' }}>
            <li>Image files only (JPG, PNG, GIF)</li>
            <li>Maximum file size: 5MB</li>
            <li>Recommended size: 400x400 pixels</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={handleUpload}
            className="btn btn-primary"
            disabled={!selectedFile || isUploading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={16} />
            {isUploading ? 'Uploading...' : 'Save Profile Picture'}
          </button>
          
          <button
            onClick={handleSkip}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <User size={16} />
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings; 