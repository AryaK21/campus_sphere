import React, { useState } from 'react';
import { Briefcase, Building, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { placementsApi } from '../../api/endpoints';

interface CreatePlacementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlacementCreated: () => void;
}

export const CreatePlacementModal: React.FC<CreatePlacementModalProps> = ({
  isOpen,
  onClose,
  onPlacementCreated,
}) => {
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [pkg, setPkg] = useState('');
  const [location, setLocation] = useState('');
  const [minCgpa, setMinCgpa] = useState<number>(7.0);
  const [departments, setDepartments] = useState<string>('Computer Science, Information Technology');
  const [batches, setBatches] = useState<string>('2026');
  const [backlogsAllowed, setBacklogsAllowed] = useState<boolean>(false);
  const [jobDescription, setJobDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [applyUrl, setApplyUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !role.trim() || !jobDescription.trim() || !deadline) {
      setError('Please fill all mandatory fields marked with *');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await placementsApi.create({
        companyName,
        role,
        package: pkg || 'Competitive CTC',
        location: location || 'Pan India / Remote',
        eligibility: {
          minCgpa: Number(minCgpa),
          allowedDepartments: departments.split(',').map((s) => s.trim()),
          allowedBatches: batches.split(',').map((s) => s.trim()),
          backlogsAllowed,
        },
        jobDescription,
        deadline,
        applyUrl,
        status: 'Active',
      });

      if (res.data.success) {
        onPlacementCreated();
        onClose();
        setCompanyName('');
        setRole('');
        setJobDescription('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create placement drive');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Announce Campus Placement Drive">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Adobe Systems"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Job Role / Designation *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Member of Technical Staff (MTS-1)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Compensation / CTC Package
            </label>
            <input
              type="text"
              placeholder="e.g. 32 LPA (Base 18L + Stock)"
              value={pkg}
              onChange={(e) => setPkg(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Location
            </label>
            <input
              type="text"
              placeholder="e.g. Noida / Bangalore"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl outline-none"
            />
          </div>
        </div>

        {/* Eligibility Details */}
        <div className="p-3.5 rounded-xl bg-gray-50/80 dark:bg-[#131B2C]/80 border border-gray-200/60 dark:border-gray-800 space-y-3">
          <p className="font-bold text-indigo-600 dark:text-indigo-400">Eligibility Criteria</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-gray-500 mb-1">Min CGPA</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={minCgpa}
                onChange={(e) => setMinCgpa(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-gray-500 mb-1">Eligible Branches (comma separated)</label>
              <input
                type="text"
                value={departments}
                onChange={(e) => setDepartments(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
            Job Description & Responsibilities *
          </label>
          <textarea
            rows={4}
            required
            placeholder="Outline qualifications, requirements, hiring process stages..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Application Deadline *
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl outline-none font-bold"
            />
          </div>
          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Application Portal Link
            </label>
            <input
              type="url"
              placeholder="https://company.com/apply"
              value={applyUrl}
              onChange={(e) => setApplyUrl(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl outline-none font-mono text-xs"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button variant="ghost" size="md" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            size="md"
            type="submit"
            isLoading={isLoading}
            leftIcon={<Briefcase className="w-4 h-4" />}
          >
            Launch Placement Drive
          </Button>
        </div>
      </form>
    </Modal>
  );
};
