import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Plus, Search, LogOut, Settings } from 'lucide-react';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) return null;

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          SocialApp
        </Link>
        
        <div className="navbar-nav">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/create-post" className="nav-link">
            <Plus size={16} />
            Create Post
          </Link>
          <Link to={`/profile/${currentUser.id}`} className="nav-link">
            Profile
          </Link>
          <Link to="/profile-settings" className="nav-link">
            <Settings size={16} />
            Settings
          </Link>
          
          <div className="nav-user">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.displayName}
              className="avatar"
            />
            <div>
              <div className="user-name">{currentUser.displayName}</div>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 