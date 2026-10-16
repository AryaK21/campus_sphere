import React, { useState } from 'react';
import { MessageSquare, Tag, Plus, X, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ForumCategory } from '../../types';
import { forumApi } from '../../api/endpoints';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<ForumCategory>('General');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Discussion']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim().replace(/^#/, '')]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.length < 5) {
      setError('Title must be at least 5 characters');
      return;
    }
    if (!body.trim() || body.length < 15) {
      setError('Body must be at least 15 characters to provide context');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await forumApi.createPost({
        title: title.trim(),
        body: body.trim(),
        category,
        tags,
      });

      if (res.data.success) {
        onPostCreated();
        onClose();
        setTitle('');
        setBody('');
        setTags(['Discussion']);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post question');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ask Question / Start Discussion">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
            Question Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. How do I optimize Dijkstra with Indexed Priority Queues for large graphs?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
          />
        </div>

        <div>
          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ForumCategory)}
            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-xs"
          >
            <option value="Placements">Placements & Company Drives</option>
            <option value="Internships">Internships & Research</option>
            <option value="Coding">Coding, DSA & Algorithms</option>
            <option value="Projects">Projects & Capstones</option>
            <option value="Exams">Exams & Academic Subjects</option>
            <option value="General">General Campus Life</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
            Detailed Explanation & Code / Context *
          </label>
          <textarea
            rows={5}
            required
            placeholder="Explain what you have tried, edge cases faced, or specific guidance needed..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-sans text-xs resize-none"
          />
        </div>

        {/* Tags Builder */}
        <div>
          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
            Topic Tags (Max 5)
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder="e.g. C++, LeetCode, Microsoft"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl outline-none"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddTag}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Tag
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-rose-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button variant="ghost" size="md" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            size="md"
            type="submit"
            isLoading={isLoading}
            leftIcon={<MessageSquare className="w-4 h-4" />}
          >
            Publish Thread
          </Button>
        </div>
      </form>
    </Modal>
  );
};
