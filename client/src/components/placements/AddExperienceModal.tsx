import React, { useState } from 'react';
import { Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Placement } from '../../types';
import { placementsApi } from '../../api/endpoints';

interface AddExperienceModalProps {
  placement: Placement | null;
  isOpen: boolean;
  onClose: () => void;
  onExperienceAdded: () => void;
}

export const AddExperienceModal: React.FC<AddExperienceModalProps> = ({
  placement,
  isOpen,
  onClose,
  onExperienceAdded,
}) => {
  const [roundDetails, setRoundDetails] = useState('');
  const [tips, setTips] = useState('');
  const [outcome, setOutcome] = useState<'Selected' | 'Rejected' | 'In-Progress'>('Selected');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!placement) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roundDetails.trim()) {
      setError('Round details and question summary are required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await placementsApi.addExperience(placement._id, {
        roundDetails,
        tips,
        outcome,
      });

      if (res.data.success) {
        onExperienceAdded();
        onClose();
        setRoundDetails('');
        setTips('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit interview review');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Share Interview Experience: ${placement.companyName}`}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
            Interview Outcome
          </label>
          <select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as any)}
            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-xs"
          >
            <option value="Selected">🎉 Offer Received / Selected</option>
            <option value="In-Progress">⏳ Rounds In-Progress</option>
            <option value="Rejected">❌ Rejected / Did not clear</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
            Rounds Breakdown & Technical Questions *
          </label>
          <textarea
            rows={5}
            required
            placeholder="e.g. Round 1: OA on HackerRank (2 questions: DP and Trees). Round 2: Inverted binary tree, LRU Cache implementation with O(1) eviction..."
            value={roundDetails}
            onChange={(e) => setRoundDetails(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs resize-none"
          />
        </div>

        <div>
          <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
            Key Preparation Advice & Tips for Juniors
          </label>
          <textarea
            rows={3}
            placeholder="What resources helped? Any pitfalls to avoid during the HM round?"
            value={tips}
            onChange={(e) => setTips(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button variant="ghost" size="md" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            size="md"
            type="submit"
            isLoading={isLoading}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Post Interview Insight
          </Button>
        </div>
      </form>
    </Modal>
  );
};
