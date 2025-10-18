import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  User, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Settings,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Projets', href: '/projects', icon: BarChart3 },
    { name: 'Analyse', href: '/analysis', icon: BarChart3 },
    { name: 'Rapports', href: '/reports', icon: BarChart3 },
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileMenuToggle = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  if (!user) {
    return null; // Pas de header sur les pages de login/register
  }

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo et navigation principale */}
        <div className="header-main">
          <div className="logo">
            <BarChart3 size={28} className="logo-icon" />
            <span className="logo-text">AnalyseFinancière</span>
          </div>

          {/* Navigation desktop */}
          <nav className="desktop-nav">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link ${isActiveRoute(item.href) ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Actions utilisateur */}
        <div className="header-actions">
          {/* Notifications */}
          <button className="action-button">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>

          {/* Paramètres */}
          <Link to="/settings" className="action-button">
            <Settings size={20} />
          </Link>

          {/* Menu profil */}
          <div className="profile-menu">
            <button 
              className="profile-button"
              onClick={handleProfileMenuToggle}
            >
              <div className="avatar">
                <User size={20} />
              </div>
              <span className="profile-name">{user.email}</span>
              <ChevronDown size={16} className={`chevron ${isProfileMenuOpen ? 'open' : ''}`} />
            </button>

            {isProfileMenuOpen && (
              <div className="profile-dropdown">
                <div className="profile-info">
                  <div className="profile-email">{user.email}</div>
                  <div className="profile-role">Utilisateur</div>
                </div>
                <div className="dropdown-divider" />
                <Link 
                  to="/profile" 
                  className="dropdown-item"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <User size={16} />
                  Mon profil
                </Link>
                <Link 
                  to="/settings" 
                  className="dropdown-item"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <Settings size={16} />
                  Paramètres
                </Link>
                <div className="dropdown-divider" />
                <button 
                  className="dropdown-item logout"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Se déconnecter
                </button>
              </div>
            )}
          </div>

          {/* Menu mobile toggle */}
          <button 
            className="mobile-menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Navigation mobile */}
      {isMenuOpen && (
        <div className="mobile-nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`mobile-nav-link ${isActiveRoute(item.href) ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
          
          <div className="mobile-nav-divider" />
          
          <Link 
            to="/profile" 
            className="mobile-nav-link"
            onClick={() => setIsMenuOpen(false)}
          >
            <User size={20} />
            Mon profil
          </Link>
          
          <Link 
            to="/settings" 
            className="mobile-nav-link"
            onClick={() => setIsMenuOpen(false)}
          >
            <Settings size={20} />
            Paramètres
          </Link>
          
          <button 
            className="mobile-nav-link logout"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            Se déconnecter
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;