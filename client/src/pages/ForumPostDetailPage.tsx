import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronUp,
  ArrowLeft,
  MessageSquare,
  CheckCircle2,
  Share2,
  Trash2,
  Send,
  User as UserIcon,
  Sparkles,
  Award,
  Check,
} from 'lucide-react';
import { ForumPost, ForumComment } from '../types';
import { forumApi } from '../api/endpoints';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export const ForumPostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [upvotesCount, setUpvotesCount] = useState<number>(0);
  const [hasUpvoted, setHasUpvoted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchPostDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await forumApi.getPostById(id);
      if (res.data.success && res.data.data) {
        const { post: postData, comments: commentsData } = res.data.data;
        setPost(postData);
        setComments(commentsData);
        setUpvotesCount(postData.upvotes?.length || 0);

        if (user && postData.upvotes) {
          setHasUpvoted(
            postData.upvotes.some((u: any) =>
              typeof u === 'string' ? u === user._id : u._id === user._id
            )
          );
        }
      }
    } catch (err) {
      console.error('Failed to fetch post details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetails();
  }, [id, user]);

  const handlePostUpvote = async () => {
    if (!post || !user) return;
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

  const handleCommentUpvote = async (commentId: string) => {
    if (!user) return;
    try {
      const res = await forumApi.toggleUpvoteComment(commentId);
      if (res.data.success && res.data.data) {
        setComments((prev: ForumComment[]) =>
          prev.map((c) => {
            if (c._id === commentId) {
              const updatedUpvotes = res.data.data?.hasUpvoted
                ? [...c.upvotes, user._id]
                : c.upvotes.filter((u: any) => (typeof u === 'string' ? u !== user._id : u._id !== user._id));
              return { ...c, upvotes: updatedUpvotes };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.error('Failed to upvote comment:', err);
    }
  };

  const handleMarkBestAnswer = async (commentId: string) => {
    if (!post || !user) return;
    try {
      const res = await forumApi.markBestAnswer(post._id, commentId);
      if (res.data.success) {
        fetchPostDetails();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to mark as best answer');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await forumApi.addComment(post._id, { content: newComment.trim() });
      if (res.data.success && res.data.data) {
        setComments([...comments, res.data.data.comment]);
        setNewComment('');
        setPost((prev: ForumPost | null) => (prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : null));
      }
    } catch (err) {
      alert('Failed to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-gray-400 font-mono text-xs">
        Loading discussion thread...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Discussion thread not found</h2>
        <Link to="/forum">
          <Button variant="primary" size="md">
            Return to Forum
          </Button>
        </Link>
      </div>
    );
  }

  const isAuthor = user && (post.author?._id === user._id || (post.author as any) === user._id);
  const canMarkSolution = isAuthor || user?.role === 'Faculty' || user?.role === 'Admin';

  return (
    <div className="space-y-8 pb-16">
      
      {/* Back Link */}
      <Link
        to="/forum"
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Discussions</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Post & Comments (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Question Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Header badges */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="purple">{post.category}</Badge>
                {post.status === 'Resolved' && (
                  <Badge variant="success">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                  </Badge>
                )}
              </div>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied' : 'Share'}</span>
              </button>
            </div>

            {/* Post Title */}
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white leading-snug">
              {post.title}
            </h1>

            {/* Author info strip */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-[#131B2C] border border-gray-200 dark:border-gray-800">
              <img
                src={post.author?.profilePicUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.author?.name || 'User'}`}
                alt="Author"
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/20"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {post.author?.name}
                </p>
                <p className="text-[11px] text-gray-400">
                  {post.author?.role} • {post.author?.department} {post.author?.semester ? `(Sem ${post.author.semester})` : ''}
                </p>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Post Body */}
            <div className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line space-y-4">
              {post.body}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                {post.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Post Actions Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={handlePostUpvote}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  hasUpvoted
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                <ChevronUp className="w-4 h-4" />
                <span>Upvote ({upvotesCount})</span>
              </button>

              <span className="text-xs text-gray-400 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                {comments.length} Comments
              </span>
            </div>

          </div>

          {/* Add Reply Form */}
          {user ? (
            <div className="glass-card rounded-3xl p-6 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                Contribute an Answer or Senior Advice
              </h3>
              <form onSubmit={handleAddComment} className="space-y-3">
                <textarea
                  rows={4}
                  required
                  placeholder="Provide step-by-step guidance, code snippet, or interview experience..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-gray-900 dark:text-white resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="gradient"
                    size="md"
                    isLoading={isSubmitting}
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    Post Answer
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-4 text-center rounded-2xl bg-gray-100 dark:bg-gray-800/50 text-xs">
              <Link to="/login" className="font-bold text-indigo-600 hover:underline">
                Sign in
              </Link>{' '}
              to participate and reply to this thread.
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
              Responses ({comments.length})
            </h3>

            {comments.map((comment) => {
              const isCommentUpvoted =
                user &&
                comment.upvotes?.some((u: any) =>
                  typeof u === 'string' ? u === user._id : u._id === user._id
                );

              return (
                <div
                  key={comment._id}
                  className={`rounded-3xl p-6 transition-all space-y-4 ${
                    comment.isBestAnswer
                      ? 'glass-card border-2 border-emerald-500/80 bg-emerald-50/10 dark:bg-emerald-950/10 shadow-lg'
                      : 'glass-card'
                  }`}
                >
                  {/* Best Answer Badge Banner */}
                  {comment.isBestAnswer && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <Award className="w-4 h-4" />
                      <span>Verified Solution / Accepted by Author & Faculty</span>
                    </div>
                  )}

                  {/* Comment Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={comment.author?.profilePicUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.author?.name || 'User'}`}
                        alt="Author"
                        className="w-8 h-8 rounded-xl object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {comment.author?.name}
                          </span>
                          <Badge variant="primary" size="sm">
                            {comment.author?.role}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {comment.author?.department} • {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Mark as Best Answer Action */}
                    {canMarkSolution && !comment.isBestAnswer && (
                      <button
                        onClick={() => handleMarkBestAnswer(comment._id)}
                        className="px-3 py-1 text-xs font-bold rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Solution</span>
                      </button>
                    )}
                  </div>

                  {/* Comment Content */}
                  <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                    {comment.content}
                  </p>

                  {/* Comment Footer: Upvote */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => handleCommentUpvote(comment._id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isCommentUpvoted
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>{comment.upvotes?.length || 0} Upvotes</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Sidebar: Author Details & Guidelines (1 Col) */}
        <div className="space-y-6">
          
          {/* Author Card */}
          <div className="glass-card rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Thread Author
            </h3>
            <div className="flex items-center gap-3">
              <img
                src={post.author?.profilePicUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.author?.name || 'User'}`}
                alt="Author"
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/20"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {post.author?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {post.author?.role} • {post.author?.department}
                </p>
              </div>
            </div>

            {post.author?.bio && (
              <p className="text-xs text-gray-500 dark:text-gray-400 italic leading-relaxed">
                "{post.author.bio}"
              </p>
            )}
          </div>

          {/* Senior Discussion Etiquette */}
          <div className="glass-card rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Community Guidelines
              </h3>
            </div>
            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-2 list-disc list-inside leading-relaxed">
              <li>Be respectful and constructive with junior peers.</li>
              <li>Provide time & space complexity for coding solutions.</li>
              <li>Mark the best solution to help upcoming batches.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
