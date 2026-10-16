import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Plus,
  HelpCircle,
  Filter,
} from 'lucide-react';
import { ForumPost } from '../types';
import { forumApi } from '../api/endpoints';
import { ForumPostCard } from '../components/forum/ForumPostCard';
import { CreatePostModal } from '../components/forum/CreatePostModal';
import { Button } from '../components/common/Button';

export const ForumPage: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [category, setCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const res = await forumApi.getPosts({
        category: category !== 'All' ? category : undefined,
        tag: selectedTag || undefined,
        search: search.trim() || undefined,
        sortBy,
      });

      if (res.data.success && res.data.data) {
        setPosts(res.data.data.posts);
      }
    } catch (err) {
      console.error('Failed to load forum posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [category, sortBy, selectedTag]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  const categories: Array<{ id: string; label: string }> = [
    { id: 'All', label: 'All Discussions' },
    { id: 'Placements', label: 'Placements & Interviews' },
    { id: 'Internships', label: 'Internships' },
    { id: 'Coding', label: 'Coding & Algorithms' },
    { id: 'Projects', label: 'Academic Projects' },
    { id: 'Exams', label: 'Exams & Study' },
    { id: 'General', label: 'General' },
  ];

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Campus Discussion Forum
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Ask technical questions, share interview preparation advice, and discuss coursework
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Discussion
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-5 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search discussions by topic, question, or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 text-sm"
            />
          </div>
          <Button type="submit" variant="primary">
            Search
          </Button>
        </form>

        {/* Categories Strip */}
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

      {/* Posts List */}
      {isLoading ? (
        <div className="py-16 text-center text-sm text-gray-500">
          Loading discussions...
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post) => (
            <ForumPostCard
              key={post._id}
              post={post}
              onDeleteSuccess={(id) => setPosts(posts.filter((p) => p._id !== id))}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 p-8 card space-y-3">
          <HelpCircle className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            No discussions found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Be the first to ask a question or start a conversation for this category!
          </p>
          <div className="pt-2">
            <Button onClick={() => setIsCreateOpen(true)} size="sm">
              Start Discussion
            </Button>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onPostCreated={fetchPosts}
      />

    </div>
  );
};

export default ForumPage;
