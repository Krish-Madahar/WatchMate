import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Film,
  Mail,
  Lock,
  LogIn,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      login(response.data.token, response.data.user);
      toast.success('Welcome back!', { icon: '👋' });
      navigate('/dashboard');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string }; status?: number }; message?: string; code?: string };
      let errorMessage = 'Login failed. Please try again.';

      if (err.response?.status === 401) {
        errorMessage = err.response?.data?.error || 'Invalid email or password';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network')) {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="glass-card p-8 space-y-6"
        >
          <motion.div variants={itemVariants} className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 mb-4"
            >
              <Film className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            <p className="text-gray-400 mt-2">Sign in to continue watching</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                    focusedField === 'email' ? 'text-primary-400' : 'text-gray-500'
                  }`}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-700/50 border rounded-xl text-white placeholder-gray-500 transition-all outline-none ${
                    focusedField === 'email'
                      ? 'border-primary-500 ring-2 ring-primary-500/20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                    focusedField === 'password' ? 'text-primary-400' : 'text-gray-500'
                  }`}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-700/50 border rounded-xl text-white placeholder-gray-500 transition-all outline-none ${
                    focusedField === 'password'
                      ? 'border-primary-500 ring-2 ring-primary-500/20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  placeholder="••••••••"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-primary-600/25"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Sign In
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          <motion.p
            variants={itemVariants}
            className="text-center text-gray-400"
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary-400 hover:text-primary-300 font-medium transition-colors inline-flex items-center gap-1"
            >
              Sign up
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}