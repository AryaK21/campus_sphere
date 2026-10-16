import React, { useState } from 'react';
import { Bell, Pin, Paperclip, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { NoticeCategory } from '../../types';
import { noticesApi } from '../../api/endpoints';

interface CreateNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoticeCreated: () => void;
}

export const CreateNoticeModal: React.FC<CreateNoticeModalProps> = ({
  isOpen,
  onClose,
  onNoticeCreated,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('Department');
  const [targetAudience, setTargetAudience] = useState<string>('All');
  const [pinned, setPinned] = useState<boolean>(false);
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }
    if (!content.trim() || content.length < 10) {
      setError('Notice content must be at least 10 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);
      formData.append('targetAudience', targetAudience);
      formData.append('pinned', pinned ? 'true' : 'false');
      if (attachmentUrl) formData.append('attachmentUrl', attachmentUrl);

      const res = await noticesApi.create(formData);
      if (res.data.success) {
        onNoticeCreated();
        onClose();
        setTitle('');
        setContent('');
        setAttachmentUrl('');
        setPinned(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to publish notice');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Publish Institutional Notice">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
            Notice Headline *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Schedule for End-Semester Practical Examinations"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as NoticeCategory)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-xs"
            >
              <option value="Department">Department</option>
              <option value="Exams">Exams & Academic</option>
              <option value="Placements">Placements</option>
              <option value="Clubs">Clubs & Cultural</option>
              <option value="Workshops">Workshops & Seminars</option>
              <option value="Holidays">Holidays & Admin</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Target Audience
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-xs"
            >
              <option value="All">All Students & Faculty</option>
              <option value="Student">All Students Only</option>
              <option value="Faculty">Faculty & Staff Only</option>
              <option value="Computer Science">Computer Science Dept</option>
              <option value="Information Technology">IT Dept</option>
              <option value="Electronics">Electronics Dept</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
            Notice Body / Announcements *
          </label>
          <textarea
            rows={5}
            required
            placeholder="Provide complete circular details, venues, timings, or instructions..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs resize-none"
          />
        </div>

        <div>
          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
            Attachment URL (Optional PDF/Circular)
          </label>
          <input
            type="url"
            placeholder="https://.../circular.pdf"
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
            className="w-full px-3.5 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl outline-none font-mono text-xs"
          />
        </div>

        {/* Pin to top checkbox */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="pinned"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
          />
          <label htmlFor="pinned" className="font-bold text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-1">
            <Pin className="w-3.5 h-3.5 text-amber-500" /> Pin this notice to the top banner
          </label>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button variant="ghost" size="md" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            size="md"
            type="submit"
            isLoading={isLoading}
            leftIcon={<Bell className="w-4 h-4" />}
          >
            Publish Notice
          </Button>
        </div>
      </form>
    </Modal>
  );
};
