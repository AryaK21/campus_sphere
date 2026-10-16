import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Building,
  GraduationCap,
  Bookmark,
  BookOpen,
  MessageSquare,
  Edit3,
  Globe,
  Check,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Resource, ForumPost } from '../types';
import { authApi, resourcesApi, forumApi } from '../api/endpoints';
import { ResourceCard } from '../components/resources/ResourceCard';
import { ForumPostCard } from '../components/forum/ForumPostCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'myUploads' | 'myPosts'>('bookmarks');
  const [bookmarkedResources, setBookmarkedResources] = useState<Resource[]>([]);
  const [myUploads, setMyUploads] = useState<Resource[]>([]);
  const [myPosts, setMyPosts] = useState<ForumPost[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [linkedin, setLinkedin] = useState(user?.socialLinks?.linkedin || '');
  const [github, setGithub] = useState(user?.socialLinks?.github || '');
  const [isLoading, setIsLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio || '');
      setLinkedin(user.socialLinks?.linkedin || '');
      setGithub(user.socialLinks?.github || '');
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Fetch full user profile with populated saved resources
      const meRes = await authApi.getMe();
      if (meRes.data.success && meRes.data.data?.user) {
        const u = meRes.data.data.user;
        updateUser(u);
        if (u.savedResources && Array.isArray(u.savedResources)) {
          setBookmarkedResources(u.savedResources as any);
        }
      }

      // Fetch user uploads
      if (user) {
        const resRes = await resourcesApi.getAll({});
        if (resRes.data.success && resRes.data.data) {
          setMyUploads(
            resRes.data.data.resources.filter(
              (r) => r.uploadedBy?._id === user._id || (r.uploadedBy as any) === user._id
            )
          );
        }

        // Fetch user forum posts
        const postRes = await forumApi.getPosts({});
        if (postRes.data.success && postRes.data.data) {
          setMyPosts(
            postRes.data.data.posts.filter(
              (p) => p.author?._id === user._id || (p.author as any) === user._id
            )
          );
        }
      }
    } catch (err) {
      console.error('Failed to load profile details:', err);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user?._id]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await authApi.updateProfile({
        name,
        bio,
        socialLinks: { linkedin, github },
      });

      if (res.data.success && res.data.data) {
        updateUser(res.data.data.user);
        setIsEditing(false);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="py-20 text-center text-gray-400 font-mono text-xs">
        Please sign in to view your profile and bookmarked resources.
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      
      {/* Profile Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={user.profilePicUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
              alt={user.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl object-cover ring-4 ring-indigo-500/20 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                  {user.name}
                </h1>
                <Badge
                  variant={
                    user.role === 'Admin' ? 'danger' : user.role === 'Faculty' ? 'purple' : 'primary'
                  }
                >
                  {user.role}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 font-mono">{user.email}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                {user.department} {user.semester ? `• Semester ${user.semester}` : ''}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="md"
            onClick={() => setIsEditing(!isEditing)}
            leftIcon={<Edit3 className="w-4 h-4" />}
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </Button>
        </div>

        {/* Bio */}
        {user.bio && !isEditing && (
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed italic border-l-2 border-indigo-500 pl-3">
            "{user.bio}"
          </p>
        )}

        {/* Social Links */}
        {(user.socialLinks?.linkedin || user.socialLinks?.github) && !isEditing && (
          <div className="flex items-center gap-3 pt-2">
            {user.socialLinks.linkedin && (
              <a
                href={user.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                LinkedIn Profile &rarr;
              </a>
            )}
            {user.socialLinks.github && (
              <a
                href={user.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-gray-700 dark:text-gray-300 hover:underline"
              >
                GitHub Profile &rarr;
              </a>
            )}
          </div>
        )}

        {/* Edit Profile Form Inline */}
        {isEditing && (
          <form
            onSubmit={handleUpdateProfile}
            className="p-5 rounded-2xl bg-gray-50 dark:bg-[#131B2C] border border-gray-200 dark:border-gray-800 space-y-4 text-xs animate-in fade-in duration-150"
          >
            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px]">
              Edit Profile Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-500 mb-1">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-500 mb-1">Short Bio & Academic Interests</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell peers about your focus areas (e.g. Distributed Systems, LeetCode, Cloud)..."
                className="w-full px-3 py-2 bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-xl outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" size="sm" isLoading={isLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Tabs Row: Bookmarks, My Uploads, My Posts */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-[#131B2C] rounded-2xl border border-gray-200 dark:border-gray-800 w-fit">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'bookmarks'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Resources ({bookmarkedResources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('myUploads')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'myUploads'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>My Uploads ({myUploads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('myPosts')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'myPosts'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>My Discussions ({myPosts.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'bookmarks' && (
          <div>
            {bookmarkedResources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarkedResources.map((res) => (
                  <ResourceCard
                    key={res._id}
                    resource={res}
                    onRateClick={() => {}}
                    onDeleteSuccess={() => loadUserData()}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 glass-card rounded-3xl p-6 space-y-2">
                <Bookmark className="w-8 h-8 text-gray-400 mx-auto" />
                <h4 className="text-sm font-bold">No saved bookmarks yet</h4>
                <p className="text-xs text-gray-500">
                  Click the bookmark icon on any course material to quickly access it here.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'myUploads' && (
          <div>
            {myUploads.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myUploads.map((res) => (
                  <ResourceCard
                    key={res._id}
                    resource={res}
                    onRateClick={() => {}}
                    onDeleteSuccess={() => loadUserData()}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 glass-card rounded-3xl p-6 space-y-2">
                <BookOpen className="w-8 h-8 text-gray-400 mx-auto" />
                <h4 className="text-sm font-bold">You haven't uploaded course material yet</h4>
                <p className="text-xs text-gray-500">
                  Share notes, PYQs, and lab manuals to help your college peers!
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'myPosts' && (
          <div>
            {myPosts.length > 0 ? (
              <div className="space-y-4">
                {myPosts.map((post) => (
                  <ForumPostCard
                    key={post._id}
                    post={post}
                    onDeleteSuccess={() => loadUserData()}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 glass-card rounded-3xl p-6 space-y-2">
                <MessageSquare className="w-8 h-8 text-gray-400 mx-auto" />
                <h4 className="text-sm font-bold">No forum questions started</h4>
                <p className="text-xs text-gray-500">
                  Ask seniors about coding, placements, or exam prep!
                </p>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
