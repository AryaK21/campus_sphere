import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Cpu,
  MessageSquare,
  Bell,
  Briefcase,
  Upload,
  Plus,
  ArrowRight,
  Pin,
  Clock,
  Download,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { resourcesApi, forumApi, noticesApi, placementsApi } from '../api/endpoints';
import { Resource, ForumPost, Notice, Placement } from '../types';
import { UploadModal } from '../components/resources/UploadModal';
import { CreatePostModal } from '../components/forum/CreatePostModal';

export const DashboardPage: React.FC = () => {
  const { user, role } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [resData, forumData, noticeData, placeData] = await Promise.all([
        resourcesApi.getAll({ limit: 5, sortBy: 'popular' }),
        forumApi.getPosts({ limit: 5, sortBy: 'recent' }),
        noticesApi.getAll({ limit: 3 }),
        placementsApi.getAll({ status: 'Active', limit: 3 }),
      ]);

      if (resData.data.data) setResources(resData.data.data.resources);
      if (forumData.data.data) setPosts(forumData.data.data.posts);
      if (noticeData.data.data) setNotices(noticeData.data.data.notices);
      if (placeData.data.data) setPlacements(placeData.data.data.placements);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 pb-12">

      {/* Welcome Banner */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title">
              Good morning, {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="page-subtitle mt-1">
              {user?.department}{user?.semester ? ` · Semester ${user.semester}` : ''} · {role}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {(role === 'Faculty' || role === 'Admin') && (
              <button
                id="upload-resource-btn"
                onClick={() => setIsUploadOpen(true)}
                className="btn-primary text-sm px-3.5 py-2"
              >
                <Upload className="w-4 h-4" />
                Upload Material
              </button>
            )}
            <button
              id="create-post-btn"
              onClick={() => setIsPostOpen(true)}
              className="btn-secondary text-sm px-3.5 py-2"
            >
              <Plus className="w-4 h-4" />
              New Discussion
            </button>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Study Materials', to: '/resources', icon: BookOpen, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Simulations', to: '/simulations', icon: Cpu, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Forum', to: '/forum', icon: MessageSquare, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Placements', to: '/placements', icon: Briefcase, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              id={`quick-link-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              className="card-hover p-4 flex flex-col items-start gap-3"
            >
              <div className={`p-2 rounded-lg ${item.bg}`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Notices */}
      {notices.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              <h2 className="section-header">Recent Notices</h2>
            </div>
            <Link to="/notices" className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {notices.map((notice) => (
              <Link
                key={notice._id}
                to="/notices"
                className={`card-hover p-4 space-y-2 ${notice.pinned ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="badge-blue text-[11px]">{notice.category}</span>
                  {notice.pinned && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      <Pin className="w-3 h-3 fill-current" /> Pinned
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">
                  {notice.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{notice.content}</p>
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                  <Clock className="w-3 h-3" />
                  {new Date(notice.createdAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Materials & Forum */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Study Materials */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <h2 className="section-header">Popular Study Materials</h2>
            </div>
            <Link to="/resources" className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              Browse all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="h-3 bg-gray-100 dark:bg-dark-tertiary rounded w-3/4 mb-2" />
                  <div className="h-2 bg-gray-100 dark:bg-dark-tertiary rounded w-1/2" />
                </div>
              ))
            ) : resources.length === 0 ? (
              <div className="card p-6 text-center text-sm text-gray-400">
                No materials yet.{' '}
                {(role === 'Faculty' || role === 'Admin') && (
                  <button onClick={() => setIsUploadOpen(true)} className="text-primary-600 hover:underline font-medium">
                    Upload the first one.
                  </button>
                )}
              </div>
            ) : (
              resources.map((res) => (
                <div key={res._id} className="card-hover p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="badge-blue text-[10px]">{res.resourceType}</span>
                      <span className="text-[10px] text-gray-400">
                        {res.subjectId?.code} · Sem {res.semester}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{res.title}</p>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                      <Download className="w-3 h-3" />
                      {res.downloadCount} downloads
                    </div>
                  </div>
                  <a
                    href={res.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs px-3 py-1.5 flex-shrink-0"
                  >
                    Download
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Forum */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-green-500" />
              <h2 className="section-header">Recent Discussions</h2>
            </div>
            <Link to="/forum" className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="h-3 bg-gray-100 dark:bg-dark-tertiary rounded w-5/6 mb-2" />
                  <div className="h-2 bg-gray-100 dark:bg-dark-tertiary rounded w-1/3" />
                </div>
              ))
            ) : posts.length === 0 ? (
              <div className="card p-6 text-center text-sm text-gray-400">
                No discussions yet.{' '}
                <button onClick={() => setIsPostOpen(true)} className="text-primary-600 hover:underline font-medium">
                  Start the first one.
                </button>
              </div>
            ) : (
              posts.map((post) => (
                <Link
                  key={post._id}
                  to={`/forum/${post._id}`}
                  className="card-hover p-3.5 block space-y-1.5"
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`badge text-[10px] ${
                      post.status === 'Resolved' ? 'badge-green' : 'badge-blue'
                    }`}>
                      {post.status}
                    </span>
                    <span className="badge-gray text-[10px]">{post.category}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1">{post.title}</p>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <span>{post.commentsCount} replies</span>
                    <span>{post.upvotes?.length || 0} upvotes</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Active Placement Drives */}
      {placements.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-500" />
              <h2 className="section-header">Active Placement Drives</h2>
            </div>
            <Link to="/placements" className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {placements.map((drive) => (
              <div key={drive._id} className="card-hover p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {drive.companyName}
                  </h3>
                  {drive.package && (
                    <span className="badge-green text-[10px] flex-shrink-0">{drive.package}</span>
                  )}
                </div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-300">{drive.role}</p>
                <div className="flex items-center gap-3 text-[10px] text-gray-400">
                  <span>Min CGPA: {drive.eligibility?.minCgpa}</span>
                  <span>·</span>
                  <span>Closes {new Date(drive.deadline).toLocaleDateString()}</span>
                </div>
                {drive.applyUrl && (
                  <a
                    href={drive.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs px-3 py-1.5 w-full"
                  >
                    Apply Now
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUploadSuccess={fetchDashboardData} />
      <CreatePostModal isOpen={isPostOpen} onClose={() => setIsPostOpen(false)} onPostCreated={fetchDashboardData} />
    </div>
  );
};
