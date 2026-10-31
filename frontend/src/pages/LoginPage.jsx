import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setLoading(true);
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md card">
        {/* Page header — same eyebrow / title / subtitle rhythm as the dashboard card */}
        <div className="space-y-1 pb-6 border-b border-[#E2E8F0]">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Secure Access
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] leading-tight">Sign In</h1>
          <p className="text-xs text-[#64748B]">
            Enter your credentials to access reception operations.
          </p>
        </div>

        {serverError && (
          <div className="mt-6 flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-rose-600" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              />
              <input
                id="email"
                type="email"
                autoComplete="username"
                className={`input-field pl-10 ${
                  errors.email ? 'border-rose-500 focus:border-rose-500' : ''
                }`}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@company.com"
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-600 mt-1.5">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className={`input-field pl-10 pr-10 ${
                  errors.password ? 'border-rose-500 focus:border-rose-500' : ''
                }`}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#94A3B8] hover:text-[#1E3A5F] hover:bg-[#F1F5F9] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-600 mt-1.5">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#64748B]">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1E3A5F] flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
            <span className="text-[11px]">Authorised staff only</span>
          </div>
          <div className="text-[11px] text-[#94A3B8]">Version 1.0.4 • Corporate</div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
