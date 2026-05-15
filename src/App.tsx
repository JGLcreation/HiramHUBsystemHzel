import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';
import { signInWithGoogle, logout, registerUser, signInEmail, getMyRentals } from './services/firebase';
import { ShoppingBag, History, LogOut, Package, User, Plus, CheckCircle, AlertCircle, Clock, LayoutDashboard, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Pages (will implement next)
import Catalog from './pages/Catalog';
import MyRentals from './pages/MyRentals';
import AdminDashboard from './pages/AdminDashboard';
import Notifications from './pages/Notifications';
import PendingItems from './pages/PendingItems';

const PendingBadge = () => {
  const { profile } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (profile) {
      const unsub = getMyRentals(profile.uid, (rentals) => {
        setCount(rentals.filter(r => r.status === 'pending').length);
      });
      return () => unsub();
    }
  }, [profile]);

  if (count === 0) return null;
  return (
    <span className="bg-amber-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
      {count}
    </span>
  );
};

const Sidebar = () => {
  const { profile, isAdmin, user } = useAuth();

  if (!user) return null;

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 shrink-0 h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">H</div>
          <span className="text-lg font-semibold tracking-tight">HiramHub</span>
        </div>
        
        <nav className="space-y-1">
          {isAdmin && (
            <>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold px-3">Command Center</div>
              <Link to="/admin" className="flex items-center gap-3 px-3 py-2 text-white bg-blue-600/10 rounded-md text-sm font-medium transition-colors border border-blue-500/20">
                <LayoutDashboard className="w-4 h-4 text-blue-400" />
                Dashboard
              </Link>
              <div className="mt-4 mb-2 h-px bg-slate-800"></div>
            </>
          )}

          {!isAdmin && (
            <>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold px-3">Navigation</div>
              <Link to="/" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md text-sm font-medium transition-colors">
                <ShoppingBag className="w-4 h-4" />
                Catalog
              </Link>
              
              <Link to="/my-rentals" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md text-sm font-medium transition-colors">
                <History className="w-4 h-4" />
                My Rentals
              </Link>

              <Link to="/pending" className="flex items-center justify-between px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md text-sm font-medium transition-colors">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4" />
                  Pending Items
                </div>
                <PendingBadge />
              </Link>

              <Link to="/notifications" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md text-sm font-medium transition-colors">
                <Bell className="w-4 h-4" />
                Notifications
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800">
        <div className="bg-slate-800/50 p-4 rounded-xl mb-4">
          <div className="text-[10px] text-slate-500 mb-1 uppercase font-bold tracking-wider">User Profile</div>
          <div className="text-sm font-medium mb-1 truncate">{profile?.displayName}</div>
          <div className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">{profile?.role}</div>
        </div>
        
        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

const Header = () => {
  const { user } = useAuth();
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user) return null;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-slate-900 hidden sm:block uppercase tracking-tight">System Terminal</h1>
        <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider">Node: Active</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Current Sync Time</span>
          <span className="text-xs font-mono font-bold text-slate-900">{time.toLocaleTimeString()}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
            <User className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </header>
  );
};

const Login = () => {
  const { user, loading, isAdmin } = useAuth();
  const [activeTab, setActiveTab ] = React.useState<'login' | 'signup'>('login');
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form states
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [studentId, setStudentId] = React.useState('');
  const [department, setDepartment] = React.useState('');
  const [role, setRole] = React.useState<'athlete' | 'non-athlete'>('non-athlete');

  if (loading) return null;
  if (user) {
    return <Navigate to={isAdmin ? "/admin" : "/"} />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signInEmail(email, password);
    } catch (err: any) {
      const message = err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
        ? 'Invalid email or password. Please verify your credentials.'
        : err.code === 'auth/too-many-requests'
        ? 'Too many failed attempts. Account temporarily locked.'
        : err.message || 'Verification failed. Access denied.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await registerUser(email, password, {
        displayName,
        fullName,
        studentId,
        department,
        role,
        email
      });
    } catch (err: any) {
      const message = err.code === 'auth/email-already-in-use' 
        ? 'This email is already registered. Please sign in instead.' 
        : err.code === 'auth/weak-password'
        ? 'Password is too weak. Please use at least 6 characters.'
        : err.code === 'auth/invalid-email'
        ? 'Please enter a valid institutional email address.'
        : err.message || 'Registration failed. Protocol error.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (activeTab === 'login') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col lg:flex-row bg-[#0c0e12] font-serif overflow-hidden"
      >
        {/* Visual Panel */}
        <div className="lg:w-1/2 h-64 lg:h-screen relative overflow-hidden group">
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1541534741688-6078c64b52d3?q=80&w=2000&auto=format&fit=crop" 
            alt="Sports Culture" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/40 to-transparent backdrop-blur-[1px]"></div>
          
          <div className="absolute inset-0 p-12 lg:p-20 flex flex-col justify-between text-white">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center gap-4"
            >
              <div className="w-12 h-12 border-2 border-white/20 flex items-center justify-center font-bold text-2xl italic bg-white/5 backdrop-blur-xl rounded-sm text-white">H</div>
              <span className="text-2xl font-black tracking-tighter uppercase font-sans">HiramHub</span>
            </motion.div>
            
            <div className="max-w-xl">
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-400/80 mb-6 block font-sans">Institutional Standard // System-Alpha</span>
                <h1 className="text-6xl lg:text-8xl font-medium leading-[0.85] mb-10 italic tracking-tighter">
                  Empowering <br />
                  <span className="text-white/40">DSSC</span> Athletic <br />
                  Excellence.
                </h1>
                <div className="w-32 h-1 bg-blue-500 mb-10 rounded-full"></div>
                <p className="font-sans text-sm text-white/50 leading-relaxed font-light max-w-sm uppercase tracking-widest italic">
                  Integrated asset management for the elite collegiate sporting environment.
                </p>
              </motion.div>
            </div>

            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 font-sans">
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Node: Active</span>
              <span>Secure Session</span>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="lg:w-1/2 min-h-screen bg-slate-950 flex items-center justify-center p-8 lg:p-24 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm relative z-10"
          >
            <div className="mb-14">
              <Link to="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2 mb-10 font-sans group">
                <span className="text-xl group-hover:translate-x-[-4px] transition-transform">←</span> Return Home
              </Link>
              <h2 className="text-5xl font-medium text-white mb-4 italic leading-none">Sign in</h2>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] font-sans">Authentication Terminal</p>
            </div>

            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mb-10 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-[10px] font-sans font-black uppercase tracking-widest"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSignIn} className="space-y-8 font-sans">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Terminal Identity</label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm font-medium text-white placeholder:text-slate-700"
                  placeholder="name@dssc.edu.ph"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Access Key</label>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm text-white placeholder:text-slate-700 font-mono tracking-widest"
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-900/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? 'Authenticating...' : 'Establish Connection'}
              </button>
            </form>

            <div className="mt-16 text-center font-sans">
              <div className="relative mb-10">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-900"></div></div>
                <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.4em]"><span className="bg-slate-950 px-4 text-slate-600">Secure Network Sync</span></div>
              </div>

              <button 
                onClick={() => signInWithGoogle()}
                className="w-full py-5 bg-white/5 border border-white/5 text-white/70 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white/10 transition-colors mb-10"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5 opacity-80" alt="Google" />
                DSSC Google Sync
              </button>
              
              <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
                Unregistered? <button onClick={() => setActiveTab('signup')} className="text-blue-500 hover:underline">Apply for Node Access</button>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // SIGN UP FORM
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#0c0e12] font-serif p-8 lg:p-20 overflow-y-auto relative"
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
      
      <div className="max-w-3xl mx-auto relative z-10">
        <motion.button 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={() => setActiveTab('login')}
          className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2 mb-20 font-sans group"
        >
          <span className="text-xl group-hover:translate-x-[-4px] transition-transform">←</span> Return to Login Terminal
        </motion.button>

        <div className="mb-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
          <div className="border-l-4 border-blue-500 pl-8">
            <h1 className="text-6xl lg:text-7xl font-medium text-white mb-4 italic leading-tight tracking-tighter">Registration</h1>
            <p className="text-slate-500 font-sans text-[11px] font-black uppercase tracking-[0.4em]">Athlete Identity Enrollment Portal</p>
          </div>
          <div className="hidden md:block pb-1">
            <div className="flex gap-1">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`h-1 flex-1 ${i < 3 ? 'bg-blue-600' : 'bg-slate-900'}`}></div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-12 p-6 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-center gap-4 text-red-400 text-[11px] font-sans font-black uppercase tracking-widest"
          >
            <AlertCircle className="w-6 h-6 shrink-0" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSignUp} className="space-y-12 font-sans">
          <section className="space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">01</span>
              <div className="h-px flex-1 bg-slate-900"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Profile</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1">Full Name</label>
                <input 
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-slate-900/30 border border-slate-900 px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm font-medium text-white placeholder:text-slate-800"
                  placeholder="Juan Dela Cruz"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1">Display Hub Handle</label>
                <input 
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full bg-slate-900/30 border border-slate-900 px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm font-medium text-white placeholder:text-slate-800"
                  placeholder="juandelacruz123"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1">Institutional Identity (Email)</label>
              <input 
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-900/30 border border-slate-900 px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm font-medium text-white placeholder:text-slate-800"
                placeholder="id@dssc.edu.ph"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1">Access Protocol Key (Password)</label>
              <input 
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-900/30 border border-slate-900 px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm text-white placeholder:text-slate-800 font-mono tracking-widest"
                placeholder="••••••••"
              />
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">02</span>
              <div className="h-px flex-1 bg-slate-900"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Academic Verification</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1">System ID Number</label>
                <input 
                  required
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  className="w-full bg-slate-900/30 border border-slate-900 px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm font-medium text-white placeholder:text-slate-800"
                  placeholder="202X-XXXXX"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1">Assigned Department</label>
                <input 
                  required
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full bg-slate-900/30 border border-slate-900 px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm font-medium text-white placeholder:text-slate-800"
                  placeholder="CAS / CoE"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 ml-1">Authorized Profile Role</label>
              <div className="relative">
                <select 
                  value={role}
                  onChange={e => setRole(e.target.value as 'athlete' | 'non-athlete')}
                  className="w-full bg-slate-900 border border-slate-900 px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-[11px] font-black uppercase tracking-[0.2em] appearance-none cursor-pointer text-blue-400"
                >
                  <option value="athlete">Collegiate Athlete Profile</option>
                  <option value="non-athlete">General Member Profile</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                  <Plus className="w-5 h-5 rotate-45" />
                </div>
              </div>
            </div>
          </section>

          <div className="pt-12">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-6 bg-white hover:bg-slate-100 text-black rounded-2xl text-[12px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-blue-500/10 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? 'Processing Identity Mapping...' : 'Initiate Secure Enrollment'}
            </button>
            <div className="mt-12 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
              Hub Access Verified? <button onClick={() => setActiveTab('login')} className="text-blue-500 hover:underline font-black">Open Terminal</button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-blue-600 font-bold">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
        <span className="text-[10px] uppercase tracking-[0.2em]">Authenticating...</span>
      </div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/" />;
  
  return <>{children}</>;
};

const AppContent = () => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Initialising Core...</p>
        </div>
      </div>
    );
  }

  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      {user && <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0">
        {user && <Header />}
        <main className={`flex-1 ${user ? 'p-6 lg:p-8' : ''} overflow-y-auto`}>
          <Routes location={location}>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                {isAdmin ? <Navigate to="/admin" replace /> : <Catalog />}
              </ProtectedRoute>
            } />
            <Route path="/my-rentals" element={
              <ProtectedRoute>
                <MyRentals />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/pending" element={
              <ProtectedRoute>
                <PendingItems />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
