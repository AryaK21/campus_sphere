import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Cpu,
  MessageSquare,
  Bell,
  Briefcase,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Resources', to: '/resources', icon: BookOpen },
  { label: 'Simulations', to: '/simulations', icon: Cpu },
  { label: 'Forum', to: '/forum', icon: MessageSquare },
  { label: 'Notices', to: '/notices', icon: Bell },
  { label: 'Placements', to: '/placements', icon: Briefcase },
  { label: 'Profile', to: '/profile', icon: User },
];

export const Sidebar: React.FC = () => {
  const { role, isAuthenticated } = useAuth();
  const location = useLocation();

  const items = [
    ...navItems,
    ...(role === 'Admin' || role === 'Faculty'
      ? [{ label: 'Admin', to: '/admin', icon: ShieldCheck }]
      : []),
  ];

  return (
    <aside className="hidden md:flex flex-col w-56 flex-shrink-0 border-r border-gray-200 dark:border-dark-border bg-white dark:bg-dark-secondary min-h-[calc(100vh-3.5rem)] sticky top-14 self-start">
      <nav className="flex flex-col gap-0.5 p-3 pt-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to ||
            (item.to !== '/' && location.pathname.startsWith(item.to));

          return (
            <NavLink
              key={item.to}
              to={item.to}
              id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              className={isActive ? 'nav-link-active' : 'nav-link'}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
              {item.label === 'Admin' && (
                <span className="ml-auto text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">
                  {role}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
