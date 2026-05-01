import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import firebaseConfig from '../../firebase-applet-config.json';
import { Wallet, Mail, Lock, Loader2, UserPlus, LogIn, AlertCircle, ExternalLink } from 'lucide-react';

export function Auth() {
  const { signIn, signInWithEmail, signUpWithEmail } = useApp();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (err: any) {
      console.error('Email auth error:', err);
      
      const errorCode = err.code;
      let message = err.message || 'Authentication failed';

      if (errorCode === 'auth/operation-not-allowed') {
        message = 'Email/Password sign-in is not enabled. Please enable it in the Firebase Console.';
      } else if (errorCode === 'auth/invalid-email') {
        message = 'Invalid email address format.';
      } else if (errorCode === 'auth/user-disabled') {
        message = 'This user account has been disabled.';
      } else if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
        message = 'Invalid email or password.';
      } else if (errorCode === 'auth/email-already-in-use') {
        message = 'This email is already registered. Try signing in.';
      } else if (errorCode === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (message.includes('Unexpected token') || message.includes('JSON')) {
        message = 'Connection error. Please refresh the page and try again.';
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn();
    } catch (error: any) {
      console.error('Google sign in error:', error);
      
      const errorCode = error.code;
      if (errorCode === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. The popup was closed.');
      } else if (errorCode === 'auth/operation-not-allowed') {
        setError('Google sign-in is not enabled. Please enable it in the Firebase Console.');
      } else {
        setError(error.message || 'Google sign-in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-black flex items-center justify-center p-4 transition-colors">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors"
      >
        <div className="p-8">
          <div className="flex items-center gap-4 mb-8 justify-center">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-600/20">
              <Wallet size={32} />
            </div>
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">FinanceFlow</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold dark:text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              {isLogin ? 'Enter your details to manage your finances.' : 'Start your financial journey with us today.'}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-transparent dark:border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all dark:text-white font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-transparent dark:border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all dark:text-white font-medium"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl mb-6"
              >
                <div className="flex gap-3">
                  <AlertCircle className="text-red-500 shrink-0" size={18} />
                  <div className="space-y-2">
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium leading-tight">
                      {error}
                    </p>
                    {error.includes('Firebase Console') && (
                      <a 
                        href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Open Firebase Console <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isLogin ? (
                <><LogIn size={20} /> Sign In</>
              ) : (
                <><UserPlus size={20} /> Create Account</>
              )}
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400">
              <span className="px-4 bg-white dark:bg-slate-900">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-bold text-slate-700 dark:text-slate-300 disabled:opacity-50 shadow-sm"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Google Account
          </button>
          
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline underline-offset-4"
              >
                {isLogin ? 'Sign Up Free' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
