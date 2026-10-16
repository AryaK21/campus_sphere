import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Plus,
} from 'lucide-react';
import { Notice, NoticeCategory } from '../types';
import { noticesApi } from '../api/endpoints';
import { NoticeCard } from '../components/notices/NoticeCard';
import { CreateNoticeModal } from '../components/notices/CreateNoticeModal';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export const NoticesPage: React.FC = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [category, setCategory] = useState<string>('All');
  const [audience, setAudience] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const canCreate = user?.role === 'Admin' || user?.role === 'Faculty';

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const res = await noticesApi.getAll({
        category: category !== 'All' ? category : undefined,
        audience: audience !== 'All' ? audience : undefined,
        search: search.trim() || undefined,
      });

      if (res.data.success && res.data.data) {
        setNotices(res.data.data.notices);
      }
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [category, audience]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNotices();
  };

  const categories: Array<{ id: string; label: string }> = [
    { id: 'All', label: 'All Notices' },
    { id: 'Exams', label: 'Exams & Timetables' },
    { id: 'Placements', label: 'Placement Drives' },
    { id: 'Department', label: 'Department' },
    { id: 'Workshops', label: 'Workshops & Hackathons' },
    { id: 'Clubs', label: 'Clubs & Cultural' },
    { id: 'Holidays', label: 'Holidays & Admin' },
  ];

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Campus Notice Board
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Examination timetables, departmental circulars, and college announcements
          </p>
        </div>

        {canCreate && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Publish Notice
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-5 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notices, exam dates, circulars..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 text-sm"
            />
          </div>
          <Button type="submit" variant="primary">
            Search
          </Button>
        </form>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100 dark:border-dark-border">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                category === cat.id
                  ? 'bg-primary-600 text-white font-semibold'
                  : 'bg-gray-100 dark:bg-dark-tertiary text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-border'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notices List */}
      {isLoading ? (
        <div className="py-16 text-center text-sm text-gray-500">
          Loading notices...
        </div>
      ) : notices.length > 0 ? (
        <div className="space-y-4">
          {notices.map((notice) => (
            <NoticeCard
              key={notice._id}
              notice={notice}
              onPinToggled={fetchNotices}
              onDeleteSuccess={(id) => setNotices(notices.filter((n) => n._id !== id))}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 p-8 card space-y-3">
          <Bell className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            No circulars found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Try choosing another category or clearing your search keywords.
          </p>
        </div>
      )}

      {/* Create Notice Modal */}
      <CreateNoticeModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onNoticeCreated={fetchNotices}
      />

    </div>
  );
};

export default NoticesPage;
