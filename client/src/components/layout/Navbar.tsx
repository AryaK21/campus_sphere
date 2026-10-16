import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Sun,
  Moon,
  Settings,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { user, role, signOut, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    setShowProfileMenu(false);
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-dark-border">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-gray-100 text-base">
            Campus<span className="text-primary-600">Sphere</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            id="theme-toggle"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-tertiary transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                id="profile-menu-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 pl-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-tertiary transition-colors"
              >
                <img
                  src={user.profilePicUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-primary-200 dark:ring-primary-800"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-none">
                    {user.name.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                    {user.role}
                  </p>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {showProfileMenu && (
                <div
                  id="profile-dropdown"
                  className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-dark-secondary rounded-xl border border-gray-200 dark:border-dark-border shadow-card-lg py-1.5 animate-slide-down z-50"
                >
                  <div className="px-3.5 py-2.5 border-b border-gray-100 dark:border-dark-border mb-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user.email}</p>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-tertiary rounded-lg mx-1"
                  >
                    <LayoutDashboard className="w-4 h-4 text-gray-400" />
                    Dashboard
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-tertiary rounded-lg mx-1"
                  >
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    My Profile
                  </Link>

                  {(role === 'Admin' || role === 'Faculty') && (
                    <Link
                      to="/admin"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-tertiary rounded-lg mx-1"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      Admin Panel
                    </Link>
                  )}

                  <div className="border-t border-gray-100 dark:border-dark-border mt-1 pt-1">
                    <button
                      id="sign-out-btn"
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg mx-1 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                id="login-link"
                className="px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                id="get-started-btn"
                className="btn-primary text-sm px-4 py-2"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
