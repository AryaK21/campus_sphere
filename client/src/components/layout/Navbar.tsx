import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LogOut,
  User as UserIcon,
  Sun,
  Moon,
  Settings,
  LayoutDashboard,
  BookOpen,
  Cpu,
  MessageSquare,
  Bell,
  Briefcase,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { user, role, signOut, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (navMenuRef.current && !navMenuRef.current.contains(e.target as Node)) {
        // Allow clicks on the toggle button itself
        const toggleBtn = document.getElementById('menu-toggle-btn');
        if (toggleBtn && !toggleBtn.contains(e.target as Node)) {
          setIsMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setShowProfileMenu(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    setShowProfileMenu(false);
    await signOut();
    navigate('/');
  };

  const navLinks = [
    ...(isAuthenticated ? [{ label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard }] : []),
    { label: 'Resources', to: '/resources', icon: BookOpen },
    { label: 'Simulations', to: '/simulations', icon: Cpu },
    { label: 'Forum', to: '/forum', icon: MessageSquare },
    { label: 'Notices', to: '/notices', icon: Bell },
    { label: 'Placements', to: '/placements', icon: Briefcase },
    ...(role === 'Admin' || role === 'Faculty' ? [{ label: 'Admin', to: '/admin', icon: Settings }] : []),
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 pointer-events-none p-3 sm:p-5">
      <div className="max-w-7xl mx-auto flex items-start justify-between gap-4">

        {/* Left: Floating Menu Show/Hide Toggle */}
        <div className="pointer-events-auto flex items-center gap-2" ref={navMenuRef}>
          <button
            id="menu-toggle-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-slate-200/80 dark:border-cyan-500/30 text-gray-800 dark:text-gray-100 shadow-xl hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all duration-200 cursor-pointer font-semibold text-xs tracking-wide"
            aria-label="Toggle navigation menu"
          >
            <div className="w-5 h-5 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              {isMenuOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
            </div>
            <span>{isMenuOpen ? 'Hide Menu' : 'Menu'}</span>
          </button>

          {/* Desktop Expandable Floating Glass Dock */}
          {isMenuOpen && (
            <nav className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-slate-200/80 dark:border-cyan-500/30 shadow-2xl animate-fadeIn">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to ||
                  (item.to !== '/' && location.pathname.startsWith(item.to));

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          )}

          {/* Mobile / Tablet Floating Drawer */}
          {isMenuOpen && (
            <div className="lg:hidden fixed top-16 left-4 right-4 sm:left-6 sm:w-80 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-cyan-500/30 shadow-2xl p-3 space-y-1 z-50 animate-fadeIn">
              <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 py-1 font-mono">
                Quick Navigation
              </p>
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to ||
                  (item.to !== '/' && location.pathname.startsWith(item.to));

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-semibold border border-cyan-500/30'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-cyan-500" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Floating Glass User Profile & Theme Toggle */}
        <div className="pointer-events-auto flex items-center gap-2">

          {/* Floating Theme Toggle Icon */}
          <button
            onClick={toggleTheme}
            id="theme-toggle"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-10 h-10 rounded-full bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center justify-center transition-all cursor-pointer text-gray-700 dark:text-gray-300"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Floating User Profile Icon */}
          {isAuthenticated && user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                id="profile-menu-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full ring-2 ring-cyan-500/40 hover:ring-cyan-400 backdrop-blur-xl bg-white/75 dark:bg-slate-900/75 shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center cursor-pointer overflow-hidden p-0.5"
                aria-label="User Profile"
              >
                <img
                  src={user.profilePicUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </button>

              {/* Floating Profile Dropdown */}
              {showProfileMenu && (
                <div
                  id="profile-dropdown"
                  className="absolute right-0 mt-2 w-56 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-2xl border border-slate-200/80 dark:border-cyan-500/30 shadow-2xl py-2 z-50 animate-fadeIn"
                >
                  <div className="px-4 py-2.5 border-b border-gray-100 dark:border-slate-800 mb-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 font-mono">{user.email}</p>
                    <span className="inline-block text-[10px] font-semibold uppercase px-2 py-0.5 mt-1.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-slate-800/70 rounded-xl mx-1.5 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-cyan-500" />
                    Dashboard
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-slate-800/70 rounded-xl mx-1.5 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    My Profile
                  </Link>

                  {(role === 'Admin' || role === 'Faculty') && (
                    <Link
                      to="/admin"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-slate-800/70 rounded-xl mx-1.5 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      Admin Panel
                    </Link>
                  )}

                  <div className="border-t border-gray-100 dark:border-slate-800 mt-1 pt-1">
                    <button
                      id="sign-out-btn"
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl mx-1 text-left cursor-pointer transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              id="login-link"
              className="px-4 py-2 rounded-2xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border border-slate-200/80 dark:border-cyan-500/30 text-gray-800 dark:text-gray-100 shadow-xl hover:border-cyan-400 text-xs font-semibold tracking-wide transition-all"
            >
              Sign In
            </Link>
          )}
        </div>

      </div>
    </header>
  );
};
