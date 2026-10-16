import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { GraduationCap, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Google icon as SVG component
const GoogleIcon: React.FC = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export const LoginPage: React.FC = () => {
  const { signInWithGoogle, loginAsDemo, isAuthenticated, isLoading, needsProfile } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  if (!isLoading && isAuthenticated && !needsProfile) {
    return <Navigate to="/dashboard" replace />;
  }
  if (!isLoading && needsProfile) {
    return <Navigate to="/complete-profile" replace />;
  }

  const handleGoogleSignIn = async () => {
    setError('');
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError('Could not sign in with Google. Please check your network and credentials.');
      setSigningIn(false);
    }
  };

  const handleDemoSignIn = async (role: 'Student' | 'Faculty' | 'Admin') => {
    setError('');
    setSigningIn(true);
    try {
      await loginAsDemo(role);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Demo login failed.');
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-primary-600 items-center justify-center shadow-card-md mx-auto">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Welcome to CampusSphere
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
              Sign in with your PCCOE college email
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="card p-6 space-y-5">

          {/* Error */}
          {error && (
            <div className="alert-error text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-In */}
          <button
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={signingIn || isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-dark-tertiary border border-gray-200 dark:border-dark-border rounded-lg
                       text-sm font-semibold text-gray-700 dark:text-gray-200
                       hover:bg-gray-50 dark:hover:bg-dark-border
                       transition-colors duration-150
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                       disabled:opacity-60 disabled:cursor-not-allowed
                       shadow-card hover:shadow-card-md cursor-pointer"
          >
            {signingIn ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
              <GoogleIcon />
            )}
            {signingIn ? 'Connecting...' : 'Continue with Google'}
          </button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Sign in with your <strong>@pccoer.in</strong> college account.
          </p>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-dark-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-dark-secondary px-2 text-gray-400 font-medium">
                Or test with demo account
              </span>
            </div>
          </div>

          {/* 1-Click Role Switcher */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              id="demo-student-btn"
              onClick={() => handleDemoSignIn('Student')}
              className="px-2 py-2 text-xs font-semibold rounded-lg bg-gray-50 dark:bg-dark-tertiary hover:bg-gray-100 dark:hover:bg-dark-border text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-dark-border transition-colors cursor-pointer text-center"
            >
              👨‍🎓 Student
            </button>
            <button
              type="button"
              id="demo-faculty-btn"
              onClick={() => handleDemoSignIn('Faculty')}
              className="px-2 py-2 text-xs font-semibold rounded-lg bg-gray-50 dark:bg-dark-tertiary hover:bg-gray-100 dark:hover:bg-dark-border text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-dark-border transition-colors cursor-pointer text-center"
            >
              👩‍🏫 Teacher
            </button>
            <button
              type="button"
              id="demo-admin-btn"
              onClick={() => handleDemoSignIn('Admin')}
              className="px-2 py-2 text-xs font-semibold rounded-lg bg-gray-50 dark:bg-dark-tertiary hover:bg-gray-100 dark:hover:bg-dark-border text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-dark-border transition-colors cursor-pointer text-center"
            >
              🛡️ Admin
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default LoginPage;
