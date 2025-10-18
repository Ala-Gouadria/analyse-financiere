import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Folder,
  TrendingUp,
  FileText,
  Settings,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: BarChart3,
      description: 'Vue d\'ensemble'
    },
    {
      name: 'Projets',
      href: '/projects',
      icon: Folder,
      description: 'Gestion des projets'
    },
    {
      name: 'Analyse',
      href: '/analysis',
      icon: TrendingUp,
      description: 'Analyse financière'
    },
    {
      name: 'Rapports',
      href: '/reports',
      icon: FileText,
      description: 'Export et rapports'
    },
  ];

  const bottomMenuItems = [
    {
      name: 'Profil',
      href: '/profile',
      icon: User
    },
    {
      name: 'Paramètres',
      href: '/settings',
      icon: Settings
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!user) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        {/* En-tête du sidebar */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <BarChart3 size={28} />
            <span>AnalyseFinancière</span>
          </div>
        </div>

        {/* Navigation principale */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-section-title">Navigation</h3>
            <ul className="nav-list">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                    >
                      <div className="nav-icon">
                        <Icon size={20} />
                      </div>
                      <div className="nav-content">
                        <span className="nav-text">{item.name}</span>
                        <span className="nav-description">{item.description}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Navigation secondaire */}
        <div className="sidebar-bottom">
          <ul className="nav-list">
            {bottomMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                  >
                    <div className="nav-icon">
                      <Icon size={20} />
                    </div>
                    <span className="nav-text">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Info utilisateur */}
          <div className="user-info">
            <div className="user-avatar">
              <User size={20} />
            </div>
            <div className="user-details">
              <div className="user-name">{user.email}</div>
              <div className="user-role">Utilisateur</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;