import React, { useState } from 'react';
import {
  Briefcase,
  MapPin,
  Clock,
  ExternalLink,
  GraduationCap,
  Sparkles,
  BookOpen,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Placement, InterviewExperience } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { placementsApi } from '../../api/endpoints';

interface PlacementCardProps {
  placement: Placement;
  onAddExperienceClick: (placement: Placement) => void;
  onDeleteSuccess?: (id: string) => void;
}

export const PlacementCard: React.FC<PlacementCardProps> = ({
  placement,
  onAddExperienceClick,
  onDeleteSuccess,
}) => {
  const { user } = useAuth();
  const [showExperiences, setShowExperiences] = useState(false);
  const canManage = user?.role === 'Admin' || user?.role === 'Faculty';

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this placement drive?')) return;
    try {
      await placementsApi.delete(placement._id);
      if (onDeleteSuccess) onDeleteSuccess(placement._id);
    } catch (err) {
      alert('Failed to delete placement drive');
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Upcoming':
        return 'warning';
      case 'Closed':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  const formatDeadline = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Deadline passed';
    if (diffDays === 0) return 'Closes today!';
    if (diffDays === 1) return '1 day remaining';
    return `${diffDays} days remaining`;
  };

  return (
    <div className="glass-card rounded-2xl p-6 shadow-sm border hover:border-indigo-500/40 transition-all space-y-4">
      
      {/* Header Row: Company, Role, Package, Status */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-500">
              Campus Drive
            </span>
            <Badge variant={getStatusVariant(placement.status)} size="sm">
              {placement.status}
            </Badge>
          </div>
          <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
            {placement.companyName}
          </h3>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {placement.role}
          </p>
        </div>

        <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2">
          <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm font-mono whitespace-nowrap">
            💰 {placement.package || 'Competitive CTC'}
          </span>
          {canManage && (
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-rose-500 p-1"
              title="Delete Drive"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Meta Pills: Location, Deadline, Eligibility */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-medium">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
          {placement.location || 'Pan India'}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          {formatDeadline(placement.deadline)}
        </span>
        <span className="flex items-center gap-1">
          <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
          Min CGPA: <strong className="text-gray-800 dark:text-gray-200">{placement.eligibility?.minCgpa || 6.0}</strong>
        </span>
      </div>

      {/* Eligibility Tags */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {placement.eligibility?.allowedDepartments?.map((dept, i) => (
          <span
            key={i}
            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            {dept}
          </span>
        ))}
        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
          {placement.eligibility?.backlogsAllowed ? 'Backlogs Allowed' : 'No Active Backlogs'}
        </span>
      </div>

      {/* Job Description */}
      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
        {placement.jobDescription}
      </p>

      {/* Action Buttons & Interview Experiences Toggle */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
        
        <button
          onClick={() => setShowExperiences(!showExperiences)}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {placement.interviewExperiences?.length || 0} Senior Interview Insights
          </span>
          {showExperiences ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <div className="flex items-center gap-2">
          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddExperienceClick(placement)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Share Experience
            </Button>
          )}

          {placement.applyUrl && (
            <a
              href={placement.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
            >
              <span>Apply Now</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

      </div>

      {/* Accordion: Interview Experiences List */}
      {showExperiences && (
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3 animate-in fade-in duration-150">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Past Interview Questions & Senior Prep Advice
          </h4>

          {placement.interviewExperiences && placement.interviewExperiences.length > 0 ? (
            <div className="space-y-3">
              {placement.interviewExperiences.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-gray-50/80 dark:bg-[#131B2C]/80 border border-gray-200/60 dark:border-gray-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={exp.author?.profilePicUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${exp.author?.name || 'Senior'}`}
                        alt="Author"
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {exp.author?.name || 'Verified Senior'}
                      </span>
                    </div>

                    <Badge
                      variant={
                        exp.outcome === 'Selected'
                          ? 'success'
                          : exp.outcome === 'Rejected'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {exp.outcome}
                    </Badge>
                  </div>

                  <div>
                    <strong className="text-gray-700 dark:text-gray-300 block mb-0.5">
                      Rounds & Questions:
                    </strong>
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                      {exp.roundDetails}
                    </p>
                  </div>

                  {exp.tips && (
                    <div className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-900 dark:text-indigo-200">
                      💡 <strong>Prep Tip:</strong> {exp.tips}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">
              No interview experiences added yet. Be the first to contribute!
            </p>
          )}
        </div>
      )}

    </div>
  );
};
