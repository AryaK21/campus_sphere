import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  BookOpen,
  MessageSquare,
  Bell,
  Briefcase,
  Trash2,
  Search,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User, Role } from '../types';
import { adminApi } from '../api/endpoints';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [searchUser, setSearchUser] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, usersRes] = await Promise.all([
        adminApi.getAnalytics(),
        adminApi.getUsers({
          role: roleFilter !== 'All' ? roleFilter : undefined,
          search: searchUser.trim() || undefined,
        }),
      ]);

      if (analyticsRes.data.success && analyticsRes.data.data) {
        setAnalytics(analyticsRes.data.data);
      }
      if (usersRes.data.success && usersRes.data.data) {
        setUsers(usersRes.data.data.users);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [roleFilter]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await adminApi.updateUserRole(userId, newRole);
      if (res.data.success) {
        setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole as Role } : u)));
        setActionMsg(`Role updated to ${newRole}`);
        setTimeout(() => setActionMsg(''), 3000);
      }
    } catch {
      setActionMsg('Failed to update role.');
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove "${userName}" from the system?`)) return;
    try {
      await adminApi.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setActionMsg('User removed.');
      setTimeout(() => setActionMsg(''), 3000);
    } catch {
      setActionMsg('Failed to remove user.');
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

  if (user?.role !== 'Admin' && user?.role !== 'Faculty') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <ShieldCheck className="w-12 h-12 text-red-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Access Restricted</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This page is only available to administrators and faculty.
        </p>
      </div>
    );
  }

  const metrics = analytics?.metrics || {};

  const statCards = [
    { label: 'Total Users', value: metrics.totalUsers || 0, sub: `${metrics.studentCount || 0} students · ${metrics.facultyCount || 0} faculty`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Study Materials', value: metrics.totalResources || 0, sub: `${metrics.totalDownloads || 0} total downloads`, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Forum Posts', value: metrics.totalForumPosts || 0, sub: `${metrics.totalComments || 0} comments`, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Active Drives', value: metrics.activePlacements || 0, sub: `${metrics.activeNotices || 0} active notices`, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ];

  return (
    <div className="space-y-6 pb-12">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-red-500" />
          <h1 className="page-title">Admin Panel</h1>
        </div>
        <p className="page-subtitle">Manage users, view system statistics, and moderate content.</p>
      </div>

      {/* Action feedback */}
      {actionMsg && (
        <div className="alert-success text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {actionMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <p className="stat-label">{stat.label}</p>
                <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className="stat-value">{isLoading ? '—' : stat.value.toLocaleString()}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* User Management Table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-dark-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="section-header">User Management</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Update roles or remove users from the system.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="user-search"
                  type="text"
                  placeholder="Search users..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchAdminData()}
                  className="input pl-8 py-2 text-xs w-48"
                />
              </div>

              <select
                id="role-filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="select py-2 text-xs w-36"
              >
                <option value="All">All Roles</option>
                <option value="Student">Students</option>
                <option value="Faculty">Faculty</option>
                <option value="Admin">Admins</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400">
              No users found.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-tertiary">
                <tr>
                  <th className="table-header text-left py-3 px-4">User</th>
                  <th className="table-header text-left py-3 px-4 hidden sm:table-cell">Department</th>
                  <th className="table-header text-left py-3 px-4">Role</th>
                  <th className="table-header text-left py-3 px-4">Change Role</th>
                  <th className="table-header text-right py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-gray-50 dark:hover:bg-dark-tertiary transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.profilePicUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{u.name}</p>
                          <p className="text-xs text-gray-400 truncate hidden sm:block">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 table-cell hidden sm:table-cell">
                      {u.department}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge text-xs ${
                        u.role === 'Admin' ? 'badge-red' :
                        u.role === 'Faculty' ? 'badge-purple' : 'badge-blue'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        id={`role-select-${u._id}`}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="select text-xs py-1.5 w-32"
                      >
                        <option value="Student">Student</option>
                        <option value="Faculty">Faculty</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        id={`delete-user-${u._id}`}
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        title="Remove user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};
