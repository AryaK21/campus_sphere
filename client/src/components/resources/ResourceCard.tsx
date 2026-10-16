import React, { useState } from 'react';
import {
  Download,
  Star,
  Bookmark,
  Trash2,
  Share2,
  Check,
  FileText,
  User,
} from 'lucide-react';
import { Resource } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { resourcesApi } from '../../api/endpoints';

interface ResourceCardProps {
  resource: Resource;
  onRateClick: (resource: Resource) => void;
  onDeleteSuccess?: (id: string) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onRateClick,
  onDeleteSuccess,
}) => {
  const { user, toggleSaveResource } = useAuth();
  const [downloadCount, setDownloadCount] = useState<number>(resource.downloadCount || 0);
  const [isSaved, setIsSaved] = useState<boolean>(() => {
    if (!user || !user.savedResources) return false;
    return user.savedResources.some((r: any) =>
      typeof r === 'string' ? r === resource._id : r._id === resource._id
    );
  });
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const isOwner = user && (resource.uploadedBy?._id === user._id || (resource.uploadedBy as any) === user._id);
  const canDelete = isOwner || user?.role === 'Admin' || user?.role === 'Faculty';

  const handleDownload = async () => {
    setDownloadCount((prev) => prev + 1);
    try {
      await resourcesApi.recordDownload(resource._id);
    } catch (err) {}
    if (resource.fileUrl) {
      window.open(resource.fileUrl, '_blank');
    }
  };

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await toggleSaveResource(resource._id);
    setIsSaved(result);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this study material?')) return;
    setIsDeleting(true);
    try {
      await resourcesApi.delete(resource._id);
      if (onDeleteSuccess) onDeleteSuccess(resource._id);
    } catch (err) {
      alert('Failed to delete resource');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.origin + `/resources?search=${encodeURIComponent(resource.title)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'Notes':
        return 'badge-purple';
      case 'PYQ':
        return 'badge-yellow';
      case 'LabManual':
        return 'badge-blue';
      case 'PPT':
        return 'badge-green';
      default:
        return 'badge-gray';
    }
  };

  return (
    <div className="card p-5 flex flex-col justify-between hover:shadow-card-md transition-shadow duration-150">
      <div className="space-y-3">
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={getTypeBadgeClass(resource.resourceType)}>
              {resource.resourceType}
            </span>
            <span className="badge-gray">
              Sem {resource.semester}
            </span>
            {resource.subjectId && (
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {resource.subjectId.code}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              title="Share link"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-tertiary transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={handleBookmarkToggle}
              title={isSaved ? 'Remove bookmark' : 'Bookmark resource'}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isSaved
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-tertiary'
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>

            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                title="Delete resource"
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">
            {resource.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
            {resource.description || 'Verified course study material and reference notes.'}
          </p>
        </div>

        {/* Subject and Department */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {resource.subjectId?.title || resource.department}
          </span>
        </div>
      </div>

      {/* Footer Details */}
      <div className="pt-4 mt-4 border-t border-gray-100 dark:border-dark-border space-y-3">
        {/* Rating and Uploader */}
        <div className="flex items-center justify-between text-xs">
          <button
            onClick={() => onRateClick(resource)}
            className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400 hover:underline cursor-pointer"
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {(resource.averageRating || 0).toFixed(1)}
            </span>
            <span className="text-gray-400">
              ({resource.ratingsCount || 0})
            </span>
          </button>

          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <span className="truncate max-w-[120px]">
              {resource.uploadedBy?.name || 'Faculty Member'}
            </span>
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-400">
            {downloadCount} downloads
          </span>

          <button
            onClick={handleDownload}
            className="btn-primary text-xs px-3 py-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};
