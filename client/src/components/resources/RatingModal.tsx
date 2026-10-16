import React, { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Resource } from '../../types';
import { resourcesApi } from '../../api/endpoints';

interface RatingModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  onRatingSuccess: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  resource,
  isOpen,
  onClose,
  onRatingSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!resource) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await resourcesApi.rate(resource._id, { rating, comment });
      onRatingSuccess();
      onClose();
      setComment('');
    } catch (err) {
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rate & Review Material">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-xs text-gray-500 font-medium">Rating for:</p>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
            {resource.title}
          </h4>
        </div>

        {/* Star Selection */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gray-50 dark:bg-[#131B2C] border border-gray-200 dark:border-gray-800 space-y-2">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300 dark:text-gray-700'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 font-mono">
            {rating === 5 && '⭐⭐⭐⭐⭐ Exceptional (5/5)'}
            {rating === 4 && '⭐⭐⭐⭐ Very Good (4/5)'}
            {rating === 3 && '⭐⭐⭐ Helpful (3/5)'}
            {rating === 2 && '⭐⭐ Fair (2/5)'}
            {rating === 1 && '⭐ Needs Improvement (1/5)'}
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            Feedback & Comments (Optional)
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share how this resource helped you prepare for exams or labs..."
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
            leftIcon={<Star className="w-4 h-4 fill-current" />}
          >
            Submit Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};
