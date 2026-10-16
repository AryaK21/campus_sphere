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
    <div className="relative min-h-[calc(100vh-6rem)]">
      {/* Background Video with Cinematic Vignette */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105 opacity-80 dark:opacity-90"
        >
          <source src="/bg-video.mp4" type="video/mp4" />
        </video>

        {/* Vignette Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.45) 0%, rgba(10, 15, 30, 0.72) 50%, rgba(2, 6, 23, 0.96) 100%)',
          }}
        />

        {/* Subtle Tech Grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.06] pointer-events-none" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 space-y-7 pb-14 max-w-7xl mx-auto">

        {/* Hero Banner with CAMPUS SPHERE Title */}
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/25 bg-slate-900/65 dark:bg-slate-950/75 backdrop-blur-xl p-6 sm:p-8 shadow-2xl text-white">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-3">
              {/* Dual-layer CAMPUS SPHERE Title */}
              <div className="select-none tracking-widest font-black uppercase font-mono">
                <div className="text-4xl sm:text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(56,189,248,0.6)] leading-none">
                  CAMPUS
                </div>
                <div
                  className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-widest leading-tight mt-1 text-transparent"
                  style={{
                    WebkitTextStroke: '2px rgba(255, 255, 255, 0.95)',
                    textShadow: '0 0 20px rgba(56, 189, 248, 0.4), 0 0 35px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  SPHERE
                </div>
              </div>

              {/* Greeting and Metadata */}
              <div className="pt-1">
                <p className="text-base sm:text-lg font-medium text-slate-200">
                  Good morning, {user?.name?.split(' ')[0] || 'there'} 👋
                </p>
                <p className="text-xs sm:text-sm text-cyan-300/80 font-mono mt-0.5">
                  {user?.department || 'Engineering'}{user?.semester ? ` · Semester ${user.semester}` : ''} · {role}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              {(role === 'Faculty' || role === 'Admin') && (
                <button
                  id="upload-resource-btn"
                  onClick={() => setIsUploadOpen(true)}
                  className="px-4 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Upload Material
                </button>
              )}
              <button
                id="create-post-btn"
                onClick={() => setIsPostOpen(true)}
                className="px-4 py-2.5 rounded-xl font-medium text-sm bg-slate-800/85 hover:bg-slate-700/85 border border-slate-700/80 text-slate-200 shadow-sm transition-all duration-200 flex items-center gap-2 backdrop-blur-md cursor-pointer"
              >
                <Plus className="w-4 h-4 text-cyan-400" />
                New Discussion
              </button>
            </div>
          </div>
        </div>

        {/* Quick Access Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[
            { label: 'Study Materials', to: '/resources', icon: BookOpen, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
            { label: 'Simulations', to: '/simulations', icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
            { label: 'Forum', to: '/forum', icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Placements', to: '/placements', icon: Briefcase, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                id={`quick-link-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                className="group relative overflow-hidden rounded-xl p-4 flex flex-col items-start gap-3 bg-white/75 dark:bg-slate-900/65 backdrop-blur-md border border-slate-200/70 dark:border-slate-800/80 shadow-md hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-200"
              >
                <div className={`p-2.5 rounded-lg border ${item.bg}`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Notices Section */}
        {notices.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight">Recent Notices</h2>
              </div>
              <Link
                to="/notices"
                className="text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {notices.map((notice) => (
                <Link
                  key={notice._id}
                  to="/notices"
                  className={`rounded-xl p-4 space-y-2 bg-white/80 dark:bg-slate-900/65 backdrop-blur-md border border-slate-200/70 dark:border-slate-800/80 shadow-md hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.12)] transition-all duration-200 ${
                    notice.pinned ? 'border-amber-400/50 dark:border-amber-500/40 bg-amber-500/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                      {notice.category}
                    </span>
                    {notice.pinned && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-500">
                        <Pin className="w-3 h-3 fill-current" /> Pinned
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">
                    {notice.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{notice.content}</p>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 pt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Main Grid: Study Materials & Forum Discussions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Popular Study Materials */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight">Popular Study Materials</h2>
              </div>
              <Link
                to="/resources"
                className="text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                Browse all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="rounded-xl p-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 animate-pulse">
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                    <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
                  </div>
                ))
              ) : resources.length === 0 ? (
                <div className="rounded-xl p-6 text-center text-sm text-gray-400 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60">
                  No materials yet.{' '}
                  {(role === 'Faculty' || role === 'Admin') && (
                    <button onClick={() => setIsUploadOpen(true)} className="text-cyan-500 hover:underline font-medium">
                      Upload the first one.
                    </button>
                  )}
                </div>
              ) : (
                resources.map((res) => (
                  <div
                    key={res._id}
                    className="rounded-xl p-3.5 flex items-center justify-between gap-3 bg-white/80 dark:bg-slate-900/65 backdrop-blur-md border border-slate-200/70 dark:border-slate-800/80 shadow-sm hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.12)] transition-all duration-200"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          {res.resourceType}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {res.subjectId?.code} · Sem {res.semester}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{res.title}</p>
                      <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                        <Download className="w-3 h-3" />
                        {res.downloadCount} downloads
                      </div>
                    </div>
                    <a
                      href={res.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 transition-colors flex-shrink-0"
                    >
                      Download
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Discussions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight">Recent Discussions</h2>
              </div>
              <Link
                to="/forum"
                className="text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="rounded-xl p-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60 animate-pulse">
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-5/6 mb-2" />
                    <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
                  </div>
                ))
              ) : posts.length === 0 ? (
                <div className="rounded-xl p-6 text-center text-sm text-gray-400 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/60">
                  No discussions yet.{' '}
                  <button onClick={() => setIsPostOpen(true)} className="text-cyan-500 hover:underline font-medium">
                    Start the first one.
                  </button>
                </div>
              ) : (
                posts.map((post) => (
                  <Link
                    key={post._id}
                    to={`/forum/${post._id}`}
                    className="rounded-xl p-3.5 block space-y-1.5 bg-white/80 dark:bg-slate-900/65 backdrop-blur-md border border-slate-200/70 dark:border-slate-800/80 shadow-sm hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.12)] transition-all duration-200"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          post.status === 'Resolved'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
                        }`}
                      >
                        {post.status}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                        {post.category}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{post.title}</p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      <span>{post.commentsCount} replies</span>
                      <span>·</span>
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
                <Briefcase className="w-4 h-4 text-amber-400" />
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight">Active Placement Drives</h2>
              </div>
              <Link
                to="/placements"
                className="text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {placements.map((drive) => (
                <div
                  key={drive._id}
                  className="rounded-xl p-4 space-y-2.5 bg-white/80 dark:bg-slate-900/65 backdrop-blur-md border border-slate-200/70 dark:border-slate-800/80 shadow-md hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.12)] transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {drive.companyName}
                    </h3>
                    {drive.package && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                        {drive.package}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300">{drive.role}</p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span>Min CGPA: {drive.eligibility?.minCgpa}</span>
                    <span>·</span>
                    <span>Closes {new Date(drive.deadline).toLocaleDateString()}</span>
                  </div>
                  {drive.applyUrl && (
                    <a
                      href={drive.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-center py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-sm transition-all"
                    >
                      Apply Now
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modals */}
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUploadSuccess={fetchDashboardData} />
      <CreatePostModal isOpen={isPostOpen} onClose={() => setIsPostOpen(false)} onPostCreated={fetchDashboardData} />
    </div>
  );
};
