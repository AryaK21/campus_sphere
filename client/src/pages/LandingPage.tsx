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
    <div className="relative min-h-screen -mx-4 sm:-mx-6 -my-6 px-4 sm:px-6 py-8 overflow-hidden">
      {/* Background Video with Cinematic Vignette */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105 opacity-80 dark:opacity-90"
        >
          <source src="/bg-video.mp4" type="video/mp4" />
        </video>

        {/* Dynamic Vignette (Light / Dark responsive) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.7)_0%,rgba(248,250,252,0.85)_50%,rgba(241,245,249,0.98)_100%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.45)_0%,rgba(10,15,30,0.75)_50%,rgba(2,6,23,0.96)_100%)]" />

        {/* Subtle Tech Grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.06] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-20 pb-16">
        
        {/* Hero Section */}
        <section className="pt-8 sm:pt-16 text-center max-w-4xl mx-auto space-y-7">
          
          {/* Dual-layer CAMPUS SPHERE Hero Title (Centered) */}
          <div className="select-none tracking-widest font-black uppercase font-mono inline-block">
            <div className="text-5xl sm:text-7xl md:text-8xl font-extrabold bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 dark:from-cyan-400 dark:via-sky-300 dark:to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(56,189,248,0.5)] leading-none">
              CAMPUS
            </div>
            <div
              className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-widest leading-tight mt-1 text-transparent"
              style={{
                WebkitTextStroke: '2.5px currentColor',
                textShadow: '0 0 25px rgba(56, 189, 248, 0.4), 0 0 40px rgba(99, 102, 241, 0.3)',
              }}
            >
              <span className="text-cyan-700 dark:text-white">SPHERE</span>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-gray-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Everything your campus needs, in one place. Course notes, interactive algorithm visualizers, student discussions, and campus placement drives.
          </p>

          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
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
          <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 max-w-xl mx-auto">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Quick Demo Testing (1-Click Switcher)
            </p>
            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              <button
                onClick={() => handleDemoLogin('Student')}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 text-gray-700 dark:text-gray-300 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 shadow-sm transition-all cursor-pointer"
              >
                👨‍🎓 Student Demo
              </button>
              <button
                onClick={() => handleDemoLogin('Faculty')}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 text-gray-700 dark:text-gray-300 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 shadow-sm transition-all cursor-pointer"
              >
                👩‍🏫 Teacher / Faculty Demo
              </button>
              <button
                onClick={() => handleDemoLogin('Admin')}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 text-gray-700 dark:text-gray-300 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 shadow-sm transition-all cursor-pointer"
              >
                🛡️ Admin Demo
              </button>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid (Glassmorphism) */}
        <section className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
              Four Core Campus Modules
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Everything built with clean tools designed specifically for engineering students and educators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: BookOpen,
                title: 'Study Materials',
                desc: 'Handwritten notes, PYQs, syllabus copies, and lab manuals organized by branch and semester.',
                to: '/resources',
                color: 'text-cyan-500 dark:text-cyan-400',
                bg: 'bg-cyan-500/10 border-cyan-500/20',
              },
              {
                icon: Cpu,
                title: 'Interactive Labs',
                desc: 'Hands-on visualizers for CPU scheduling algorithms, sorting logic, network subnetting, and logic gates.',
                to: '/simulations',
                color: 'text-purple-500 dark:text-purple-400',
                bg: 'bg-purple-500/10 border-purple-500/20',
              },
              {
                icon: MessageSquare,
                title: 'Discussion Forum',
                desc: 'Ask academic questions, share exam solutions, and get verified answers endorsed by college faculty.',
                to: '/forum',
                color: 'text-emerald-500 dark:text-emerald-400',
                bg: 'bg-emerald-500/10 border-emerald-500/20',
              },
              {
                icon: Briefcase,
                title: 'Placement Drives',
                desc: 'Live campus placement announcements, CTC details, eligibility checklists, and interview guides.',
                to: '/placements',
                color: 'text-amber-500 dark:text-amber-400',
                bg: 'bg-amber-500/10 border-amber-500/20',
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  to={card.to}
                  className="rounded-2xl p-6 bg-white/80 dark:bg-slate-900/65 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-md hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all duration-200 group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${card.bg}`}>
                      <Icon className={`w-6 h-6 ${card.color}`} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center text-xs font-semibold text-cyan-600 dark:text-cyan-400 group-hover:gap-1.5 transition-all">
                    <span>Explore module</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Roles Section */}
        <section className="rounded-2xl p-8 bg-white/80 dark:bg-slate-900/65 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Built for Every Role on Campus
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Custom-tailored permissions and interfaces for students, faculty members, and administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {[
              {
                role: 'Students',
                badge: 'Primary Users',
                features: [
                  'Download verified notes & previous year papers',
                  'Run step-by-step computer science simulators',
                  'Post academic queries and receive peer/faculty answers',
                  'Check placement drive eligibility with one click',
                ],
              },
              {
                role: 'Faculty Members',
                badge: 'Course Educators',
                features: [
                  'Upload study materials for your subjects and semester',
                  'Publish official department notices with priority pin',
                  'Mark solutions as verified to guide student discussions',
                  'Share interview preparation materials and notes',
                ],
              },
              {
                role: 'Administrators',
                badge: 'System Governance',
                features: [
                  'Manage user roles and assign faculty privileges',
                  'Review platform usage statistics and analytics',
                  'Moderate forum questions, reports, and notices',
                  'Control placement postings and announcements',
                ],
              },
            ].map((item) => (
              <div key={item.role} className="space-y-4 p-5 rounded-xl bg-white/50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{item.role}</h3>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                    {item.badge}
                  </span>
                </div>
                <ul className="space-y-2.5">
                  {item.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="text-center rounded-2xl p-8 sm:p-12 bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-xl space-y-5">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Ready to get started with CampusSphere?
          </h2>
          <p className="text-sm sm:text-base text-cyan-100 max-w-xl mx-auto">
            Log in with your official @pccoer.in email to access your personalized dashboard, notes, and labs.
          </p>
          <div className="pt-2">
            <Link to="/login">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 shadow-md">
                Sign in with Google
              </Button>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
};
