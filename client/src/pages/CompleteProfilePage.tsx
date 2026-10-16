import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

const DEPARTMENTS = [
  'Computer Engineering',
  'Information Technology',
  'Electronics & Telecommunication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Artificial Intelligence & Data Science',
  'AIDS',
  'Other',
];

export const CompleteProfilePage: React.FC = () => {
  const { completeRegistration, session, needsProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: session?.user?.user_metadata?.full_name || '',
    department: '',
    semester: '1',
    role: 'Student' as Role,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If no session or doesn't need profile, redirect
  if (!session) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.department) {
      setError('Please fill in your name and department.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await completeRegistration({
        name: formData.name,
        department: formData.department,
        semester: Number(formData.semester),
        role: formData.role,
      });
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to complete registration. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-primary-600 items-center justify-center shadow-card-md mx-auto">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Complete Your Profile
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
              Welcome! Just a few more details to get you set up.
            </p>
          </div>
        </div>

        {/* Email display */}
        <div className="flex items-center gap-3 p-3.5 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <img
              src={session.user?.user_metadata?.avatar_url || ''}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-green-700 dark:text-green-400">Signed in as</p>
            <p className="text-sm font-semibold text-green-800 dark:text-green-300 truncate">
              {session.user?.email}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="card p-6">
          {error && (
            <div className="alert-error text-sm mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="profile-name" className="label">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="profile-name"
                type="text"
                required
                placeholder="e.g. Arjun Sharma"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="input"
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="profile-role" className="label">
                I am a <span className="text-red-500">*</span>
              </label>
              <select
                id="profile-role"
                value={formData.role}
                onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value as Role }))}
                className="select"
              >
                <option value="Student">Student</option>
                <option value="Faculty">Faculty / Staff</option>
              </select>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Admin accounts are provisioned by the administrator after signup.
              </p>
            </div>

            {/* Department */}
            <div>
              <label htmlFor="profile-department" className="label">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                id="profile-department"
                required
                value={formData.department}
                onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))}
                className="select"
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Semester (students only) */}
            {formData.role === 'Student' && (
              <div>
                <label htmlFor="profile-semester" className="label">
                  Current Semester
                </label>
                <select
                  id="profile-semester"
                  value={formData.semester}
                  onChange={(e) => setFormData((p) => ({ ...p, semester: e.target.value }))}
                  className="select"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={String(s)}>Semester {s}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              id="complete-profile-btn"
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting up your account...
                </>
              ) : (
                'Complete Setup'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
