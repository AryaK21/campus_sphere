import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Plus,
  Building,
} from 'lucide-react';
import { Placement } from '../types';
import { placementsApi } from '../api/endpoints';
import { PlacementCard } from '../components/placements/PlacementCard';
import { CreatePlacementModal } from '../components/placements/CreatePlacementModal';
import { AddExperienceModal } from '../components/placements/AddExperienceModal';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export const PlacementsPage: React.FC = () => {
  const { user } = useAuth();
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [status, setStatus] = useState<string>('All');
  const [department, setDepartment] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [selectedPlacement, setSelectedPlacement] = useState<Placement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const canManage = user?.role === 'Admin' || user?.role === 'Faculty';

  const fetchPlacements = async () => {
    setIsLoading(true);
    try {
      const res = await placementsApi.getAll({
        status: status !== 'All' ? status : undefined,
        department: department !== 'All' ? department : undefined,
        search: search.trim() || undefined,
      });

      if (res.data.success && res.data.data) {
        setPlacements(res.data.data.placements);
      }
    } catch (err) {
      console.error('Failed to load placement drives:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements();
  }, [status, department]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPlacements();
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Campus Placement Portal
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track active recruitment drives, check eligibility, apply directly, and read senior interview experiences
          </p>
        </div>

        {canManage && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Post Placement Drive
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-5 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search companies (Microsoft, Google, Amazon...), roles, packages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 text-sm"
            />
          </div>
          <Button type="submit" variant="primary">
            Search
          </Button>
        </form>

        {/* Status and Department Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-dark-border text-xs">
          
          {/* Status tabs */}
          <div className="flex items-center gap-1.5">
            {['All', 'Active', 'Upcoming', 'Closed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  status === st
                    ? 'bg-primary-600 text-white font-semibold'
                    : 'bg-gray-100 dark:bg-dark-tertiary text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-border'
                }`}
              >
                {st === 'All' ? 'All Drives' : st}
              </button>
            ))}
          </div>

          {/* Department dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">Eligible Branch:</span>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="select text-xs py-1.5"
            >
              <option value="All">All Departments</option>
              <option value="Computer Engineering">Computer Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Telecommunication">Electronics & Telecom</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
            </select>
          </div>

        </div>
      </div>

      {/* Placement Drives List */}
      {isLoading ? (
        <div className="py-16 text-center text-sm text-gray-500">
          Loading placement drives...
        </div>
      ) : placements.length > 0 ? (
        <div className="space-y-4">
          {placements.map((placement) => (
            <PlacementCard
              key={placement._id}
              placement={placement}
              onAddExperienceClick={(p) => setSelectedPlacement(p)}
              onDeleteSuccess={(id) => setPlacements(placements.filter((p) => p._id !== id))}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 p-8 card space-y-3">
          <Building className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            No placement drives found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Try adjusting your filters or check back soon for new recruitment notices!
          </p>
        </div>
      )}

      {/* Modals */}
      <CreatePlacementModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onPlacementCreated={fetchPlacements}
      />
      <AddExperienceModal
        isOpen={!!selectedPlacement}
        placement={selectedPlacement}
        onClose={() => setSelectedPlacement(null)}
        onExperienceAdded={fetchPlacements}
      />

    </div>
  );
};

export default PlacementsPage;
