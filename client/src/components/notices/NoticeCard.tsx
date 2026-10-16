import React from 'react';
import { Pin, Calendar, Paperclip, Trash2, Users, Download } from 'lucide-react';
import { Notice } from '../../types';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { noticesApi } from '../../api/endpoints';

interface NoticeCardProps {
  notice: Notice;
  onDeleteSuccess?: (id: string) => void;
  onPinToggled?: () => void;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({
  notice,
  onDeleteSuccess,
  onPinToggled,
}) => {
  const { user } = useAuth();
  const canManage = user?.role === 'Admin' || user?.role === 'Faculty';

  const handleTogglePin = async () => {
    try {
      await noticesApi.togglePin(notice._id);
      if (onPinToggled) onPinToggled();
    } catch (err) {
      alert('Failed to update pin status');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this notice?')) return;
    try {
      await noticesApi.delete(notice._id);
      if (onDeleteSuccess) onDeleteSuccess(notice._id);
    } catch (err) {
      alert('Failed to delete notice');
    }
  };

  const getCategoryVariant = (cat: string) => {
    switch (cat) {
      case 'Exams':
        return 'danger';
      case 'Placements':
        return 'success';
      case 'Workshops':
        return 'purple';
      case 'Department':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      className={`glass-card rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between relative border ${
        notice.pinned
          ? 'border-indigo-500/50 bg-indigo-50/20 dark:bg-indigo-950/15 ring-1 ring-indigo-500/20 shadow-md'
          : 'hover:border-gray-300 dark:hover:border-gray-700'
      }`}
    >
      <div>
        {/* Header Badges & Pinned Tag */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getCategoryVariant(notice.category)} size="sm">
              {notice.category}
            </Badge>

            {notice.pinned && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200/50">
                <Pin className="w-3 h-3 fill-current" /> Pinned Notice
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canManage && (
              <>
                <button
                  onClick={handleTogglePin}
                  title={notice.pinned ? 'Unpin' : 'Pin to top'}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    notice.pinned
                      ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50'
                      : 'text-gray-400 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  title="Delete notice"
                  className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug mb-2">
          {notice.title}
        </h3>

        {/* Content */}
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line mb-4">
          {notice.content}
        </p>
      </div>

      {/* Footer Info & Attachment */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            {formatDate(notice.createdAt)}
          </span>
          <span className="flex items-center gap-1 font-medium">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            {notice.targetAudience?.join(', ') || 'All'}
          </span>
        </div>

        {notice.attachmentUrl && (
          <a
            href={notice.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 font-semibold transition-colors"
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span>Attachment PDF</span>
          </a>
        )}
      </div>
    </div>
  );
};
