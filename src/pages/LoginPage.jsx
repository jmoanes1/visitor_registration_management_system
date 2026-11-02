import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider.jsx';
import { APP_VERSION } from '@/config/app.js';
import { TextField } from '@/components/FormFields.jsx';
import { apiErrorMessage } from '@/utils/apiError.js';

const emptyCredentials = { username: '', password: '' };

const LoginPage = () => {
  const [credentials, setCredentials] = useState(emptyCredentials);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const updateField = (field) => (event) => {
    setCredentials((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');

    const nextErrors = {};
    if (!credentials.username) nextErrors.username = 'Username is required';
    if (!credentials.password) nextErrors.password = 'Password is required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await signIn(credentials);
      navigate('/dashboard');
    } catch (error) {
      setServerError(apiErrorMessage(error, 'Sign in failed. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md card">
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
          <div
            role="alert"
            className="mt-6 flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700"
          >
            <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-rose-600" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <TextField
            id="username"
            name="username"
            label="Username"
            type="text"
            required
            icon={User}
            autoComplete="username"
            placeholder="admin"
            value={credentials.username}
            onChange={updateField('username')}
            error={errors.username}
          />

          <TextField
            id="password"
            name="password"
            label="Password"
            type={isPasswordVisible ? 'text' : 'password'}
            required
            icon={Lock}
            autoComplete="current-password"
            placeholder="••••••••"
            value={credentials.password}
            onChange={updateField('password')}
            error={errors.password}
            trailing={
              <button
                type="button"
                onClick={() => setIsPasswordVisible((visible) => !visible)}
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#1E3A5F] hover:bg-[#F1F5F9] transition-colors"
              >
                {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? (
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
          <div className="text-[11px] text-[#94A3B8]">Version {APP_VERSION} • Corporate</div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
