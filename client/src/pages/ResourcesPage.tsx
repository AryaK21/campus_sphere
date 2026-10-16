import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Upload,
  RotateCcw,
  FileCode,
  Filter,
} from 'lucide-react';
import { Resource, Subject, ResourceType } from '../types';
import { resourcesApi, subjectsApi } from '../api/endpoints';
import { ResourceCard } from '../components/resources/ResourceCard';
import { UploadModal } from '../components/resources/UploadModal';
import { RatingModal } from '../components/resources/RatingModal';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

export const ResourcesPage: React.FC = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [department, setDepartment] = useState<string>('All');
  const [semester, setSemester] = useState<string>('All');
  const [subjectId, setSubjectId] = useState<string>('All');
  const [resourceType, setResourceType] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [ratingResource, setRatingResource] = useState<Resource | null>(null);

  const canUpload = user?.role === 'Faculty' || user?.role === 'Admin';

  const fetchSubjects = async () => {
    try {
      const res = await subjectsApi.getAll();
      if (res.data.success && res.data.data) {
        setSubjects(res.data.data.subjects);
      }
    } catch (err) {
      console.error('Failed to load subjects:', err);
    }
  };

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const res = await resourcesApi.getAll({
        department: department !== 'All' ? department : undefined,
        semester: semester !== 'All' ? semester : undefined,
        subjectId: subjectId !== 'All' ? subjectId : undefined,
        resourceType: resourceType !== 'All' ? resourceType : undefined,
        search: search.trim() ? search : undefined,
        sortBy,
      });

      if (res.data.success && res.data.data) {
        setResources(res.data.data.resources);
      }
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchResources();
  }, [department, semester, subjectId, resourceType, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  const resetFilters = () => {
    setDepartment('All');
    setSemester('All');
    setSubjectId('All');
    setResourceType('All');
    setSearch('');
    setSortBy('newest');
  };

  const resourceTypesList = [
    'All',
    'Notes',
    'PYQ',
    'LabManual',
    'PPT',
    'Syllabus',
    'ReferenceBook',
    'Assignment',
  ];

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Study Materials & Notes
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse verified syllabus guides, previous year question papers, and laboratory manuals
          </p>
        </div>

        {canUpload && (
          <Button
            onClick={() => setIsUploadOpen(true)}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Upload Material
          </Button>
        )}
      </div>

      {/* Filter and Search Card */}
      <div className="card p-5 space-y-4">
        
        {/* Search row */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by topic, keyword, or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button type="submit" variant="primary">
              Search
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={resetFilters}
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </form>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-100 dark:border-dark-border text-xs">
          <div>
            <label className="label text-xs">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="select text-xs"
            >
              <option value="All">All Departments</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Telecommunication">Electronics & Telecom</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
            </select>
          </div>

          <div>
            <label className="label text-xs">
              Semester
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="select text-xs"
            >
              <option value="All">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label text-xs">
              Subject
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="select text-xs truncate"
            >
              <option value="All">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.code} - {sub.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label text-xs">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select text-xs"
            >
              <option value="newest">Most Recent</option>
              <option value="popular">Most Downloaded</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Resource Type Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          {resourceTypesList.map((type) => (
            <button
              key={type}
              onClick={() => setResourceType(type)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                resourceType === type
                  ? 'bg-primary-600 text-white font-semibold'
                  : 'bg-gray-100 dark:bg-dark-tertiary text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-border'
              }`}
            >
              {type === 'All' ? 'All Materials' : type}
            </button>
          ))}
        </div>

      </div>

      {/* Resources Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-sm text-gray-500">
          Loading study materials...
        </div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              onRateClick={(res) => setRatingResource(res)}
              onDeleteSuccess={(id) => setResources(resources.filter((r) => r._id !== id))}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 p-8 card space-y-3">
          <BookOpen className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            No study materials found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Try adjusting your search query, selecting another semester, or resetting filters.
          </p>
        </div>
      )}

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={fetchResources}
      />
      <RatingModal
        isOpen={!!ratingResource}
        resource={ratingResource}
        onClose={() => setRatingResource(null)}
        onRatingSuccess={fetchResources}
      />

    </div>
  );
};

export default ResourcesPage;
