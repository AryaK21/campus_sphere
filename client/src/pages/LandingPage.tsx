import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Cpu,
  MessageSquare,
  Briefcase,
  Bell,
  CheckCircle2,
  ArrowRight,
  Shield,
  GraduationCap,
  Sparkles,
  Users,
  BarChart2,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async (role: 'Student' | 'Faculty' | 'Admin') => {
    await loginAsDemo(role);
    navigate('/dashboard');
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="pt-8 sm:pt-14 text-center max-w-4xl mx-auto space-y-6">
        
        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight leading-tight">
          Everything your campus needs,{' '}
          <span className="text-primary-600 dark:text-primary-400">in one place.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Course notes, interactive algorithm visualizers, student discussions, and campus placement drives.
        </p>

        {/* Main Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Sign in with Google
              </Button>
            </Link>
          )}

          <Link to="/resources">
            <Button variant="secondary" size="lg" leftIcon={<BookOpen className="w-4 h-4" />}>
              Browse Study Materials
            </Button>
          </Link>

          <Link to="/simulations">
            <Button variant="secondary" size="lg" leftIcon={<Cpu className="w-4 h-4" />}>
              Try Interactive Labs
            </Button>
          </Link>
        </div>

        {/* 1-Click Instant Demo Login Switcher */}
        <div className="pt-6 border-t border-gray-200 dark:border-dark-border max-w-xl mx-auto">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Quick Demo Testing (1-Click Switcher)
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => handleDemoLogin('Student')}
              className="px-3.5 py-2 text-xs font-medium rounded-lg bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 shadow-sm transition-colors cursor-pointer"
            >
              👨‍🎓 Student Demo
            </button>
            <button
              onClick={() => handleDemoLogin('Faculty')}
              className="px-3.5 py-2 text-xs font-medium rounded-lg bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 shadow-sm transition-colors cursor-pointer"
            >
              👩‍🏫 Teacher / Faculty Demo
            </button>
            <button
              onClick={() => handleDemoLogin('Admin')}
              className="px-3.5 py-2 text-xs font-medium rounded-lg bg-white dark:bg-dark-secondary border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 shadow-sm transition-colors cursor-pointer"
            >
              🛡️ Admin Demo
            </button>
          </div>
        </div>

      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Core Academic Features
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Carefully built to make learning, sharing, and campus life effortless.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1 */}
          <Link
            to="/resources"
            className="card p-6 flex flex-col justify-between hover:border-primary-500 dark:hover:border-primary-500 transition-all group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                Study Materials & Notes
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Filter verified syllabus notes, previous year solved questions, and lab manuals by semester and department.
              </p>
            </div>
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 pt-4 flex items-center gap-1">
              Browse library &rarr;
            </span>
          </Link>

          {/* Card 2 */}
          <Link
            to="/simulations"
            className="card p-6 flex flex-col justify-between hover:border-primary-500 dark:hover:border-primary-500 transition-all group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                Interactive CS Labs
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Hands-on visualizers for sorting algorithms, CPU scheduling with dynamic Gantt charts, logic gates, and subnetting.
              </p>
            </div>
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 pt-4 flex items-center gap-1">
              Open visualizers &rarr;
            </span>
          </Link>

          {/* Card 3 */}
          <Link
            to="/forum"
            className="card p-6 flex flex-col justify-between hover:border-primary-500 dark:hover:border-primary-500 transition-all group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                Discussion Forum
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Ask academic questions, share interview preparation advice, and find faculty-verified answers.
              </p>
            </div>
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 pt-4 flex items-center gap-1">
              Join discussions &rarr;
            </span>
          </Link>

          {/* Card 4 */}
          <Link
            to="/placements"
            className="card p-6 flex flex-col justify-between hover:border-primary-500 dark:hover:border-primary-500 transition-all group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                Placements & Notices
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Stay updated with campus recruitment drives, eligibility criteria, and department circulars.
              </p>
            </div>
            <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 pt-4 flex items-center gap-1">
              View placement drives &rarr;
            </span>
          </Link>

        </div>
      </section>

      {/* Role-Specific Workflows Section */}
      <section className="card p-8 max-w-6xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Tailored for Every Role
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Built with clear permissions so students, teachers, and admins have exactly what they need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Student */}
          <div className="space-y-3 p-4 rounded-xl bg-gray-50 dark:bg-dark-tertiary/40 border border-gray-100 dark:border-dark-border">
            <div className="flex items-center gap-2">
              <span className="text-lg">👨‍🎓</span>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">For Students</h3>
            </div>
            <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Search and download course notes & solved question papers.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Interact with algorithm visualizers to learn faster.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Track placement drives and check CGPA eligibility.</span>
              </li>
            </ul>
          </div>

          {/* Teacher */}
          <div className="space-y-3 p-4 rounded-xl bg-gray-50 dark:bg-dark-tertiary/40 border border-gray-100 dark:border-dark-border">
            <div className="flex items-center gap-2">
              <span className="text-lg">👩‍🏫</span>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">For Teachers & Faculty</h3>
            </div>
            <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                <span>Upload lecture notes, presentations, and lab guides.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                <span>Publish departmental circulars and exam schedules.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                <span>Verify and endorse correct student answers on forum threads.</span>
              </li>
            </ul>
          </div>

          {/* Admin */}
          <div className="space-y-3 p-4 rounded-xl bg-gray-50 dark:bg-dark-tertiary/40 border border-gray-100 dark:border-dark-border">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛡️</span>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">For Administrators</h3>
            </div>
            <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Manage campus accounts and modify user roles.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>View platform analytics: total downloads, active drives, users.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Moderate discussions, circulars, and course repositories.</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

    </div>
  );
};

export default LandingPage;
