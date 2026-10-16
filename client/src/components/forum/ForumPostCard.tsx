import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronUp,
  MessageSquare,
  Eye,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { ForumPost } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { forumApi } from '../../api/endpoints';

interface ForumPostCardProps {
  post: ForumPost;
  onDeleteSuccess?: (id: string) => void;
}

export const ForumPostCard: React.FC<ForumPostCardProps> = ({ post, onDeleteSuccess }) => {
  const { user } = useAuth();
  const [upvotesCount, setUpvotesCount] = useState<number>(post.upvotes?.length || 0);
  const [hasUpvoted, setHasUpvoted] = useState<boolean>(() => {
    if (!user || !post.upvotes) return false;
    return post.upvotes.some((u: any) => (typeof u === 'string' ? u === user._id : u._id === user._id));
  });

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    try {
      const res = await forumApi.toggleUpvotePost(post._id);
      if (res.data.success && res.data.data) {
        setUpvotesCount(res.data.data.upvotesCount);
        setHasUpvoted(res.data.data.hasUpvoted);
      }
    } catch (err) {
      console.error('Failed to upvote post:', err);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this discussion post?')) return;

    try {
      await forumApi.deletePost(post._id);
      if (onDeleteSuccess) onDeleteSuccess(post._id);
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  const isOwner = user && (post.author?._id === user._id || (post.author as any) === user._id);
  const canDelete = isOwner || user?.role === 'Admin' || user?.role === 'Faculty';

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Link
      to={`/forum/${post._id}`}
      className="card p-5 block hover:border-gray-300 dark:hover:border-dark-border-strong hover:shadow-card-md transition-all duration-150"
    >
      <div className="flex items-start gap-4">
        
        {/* Upvote Button */}
        <button
          onClick={handleUpvote}
          className={`flex flex-col items-center justify-center min-w-[48px] py-2 px-1 rounded-lg border transition-colors cursor-pointer ${
            hasUpvoted
              ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400 font-bold'
              : 'bg-white dark:bg-dark-tertiary border-gray-200 dark:border-dark-border text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <ChevronUp className="w-5 h-5" />
          <span className="text-xs font-semibold">{upvotesCount}</span>
        </button>

        {/* Post Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="badge-yellow">
              {post.category}
            </span>

            {post.status === 'Resolved' && (
              <span className="badge-green">
                <CheckCircle2 className="w-3 h-3" /> Answered
              </span>
            )}

            <span className="text-xs text-gray-400">
              Posted by {post.author?.name || 'Anonymous'} · {formatDate(post.createdAt)}
            </span>
          </div>

          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1">
            {post.title}
          </h3>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
            {post.body}
          </p>

          {/* Tags & Meta Row */}
          <div className="flex items-center justify-between gap-4 mt-3 pt-2.5 border-t border-gray-100 dark:border-dark-border text-xs text-gray-400">
            <div className="flex items-center gap-1.5 flex-wrap">
              {post.tags && post.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[11px] bg-gray-100 dark:bg-dark-tertiary text-gray-600 dark:text-gray-300"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                {post.commentsCount || 0} replies
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {post.viewsCount || 0} views
              </span>

              {canDelete && (
                <button
                  onClick={handleDelete}
                  title="Delete post"
                  className="p-1 rounded text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </Link>
  );
};
