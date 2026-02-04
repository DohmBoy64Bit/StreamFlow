import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Recover = () => {
  const [username, setUsername] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { recover } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !recoveryCode || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    const result = await recover(username, recoveryCode, newPassword);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setError(result.error);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-streamflow-navy flex items-center justify-center px-4 relative overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-streamflow-blue/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-streamflow-cyan/10 blur-[150px] rounded-full" />
        <div className="w-full max-w-md relative z-10">
          <div className="card p-8 text-center border-white/5">
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Password Reset Successful!</h2>
            <p className="text-gray-400">
              Your password has been reset. Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-streamflow-navy flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-streamflow-cyan mb-2 tracking-tighter" style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.4))' }}>StreamFlow</h1>
          <p className="text-cyan-100/50 font-light tracking-wide italic">Recover Your Account</p>
        </div>

        <div className="card p-8 border-white/5">
          <h2 className="text-2xl font-bold text-white mb-6">Reset Password</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4 p-3 bg-blue-900/50 border border-blue-700 rounded text-blue-200 text-sm">
            Enter your username and one of your recovery codes to reset your password.
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="recovery-code" className="block text-sm font-medium mb-2">
                Recovery Code
              </label>
              <input
                id="recovery-code"
                type="text"
                className="input-field font-mono"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                placeholder="Enter one of your recovery codes"
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="new-password" className="block text-sm font-medium mb-2">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                className="input-field"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 characters)"
                disabled={loading}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="confirm-password" className="block text-sm font-medium mb-2">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full mb-4"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-gray-400 hover:text-streamflow-cyan transition-all duration-300"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Recover;
