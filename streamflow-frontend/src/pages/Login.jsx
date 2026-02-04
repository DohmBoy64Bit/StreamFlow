import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Dialog } from '@headlessui/react';

const Login = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState([]);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    const result = await register(username, password);
    setLoading(false);

    if (result.success) {
      setRecoveryCodes(result.recoveryCodes);
      setShowRecoveryCodes(true);
    } else {
      setError(result.error);
    }
  };

  const handleRecoveryCodesClose = () => {
    setShowRecoveryCodes(false);
    setActiveTab('login');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-streamflow-navy flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-streamflow-blue/10 blur-[150px] rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-streamflow-cyan/10 blur-[150px] rounded-full" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-streamflow-cyan mb-2 tracking-tighter" style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.4))' }}>StreamFlow</h1>
          <p className="text-cyan-100/50 font-light tracking-wide italic">Level up your streaming experience</p>
        </div>

        <div className="card p-8 border-white/5 shadow-2xl">
          <div className="flex mb-6 border-b border-white/10">
            <button
              className={`flex-1 py-3 text-center font-semibold transition-all duration-300 ${activeTab === 'login'
                ? 'text-streamflow-cyan border-b-2 border-streamflow-cyan shadow-[0_4px_10px_-4px_rgba(0,255,255,0.4)]'
                : 'text-gray-400 hover:text-white'
                }`}
              onClick={() => {
                setActiveTab('login');
                setError('');
              }}
            >
              Login
            </button>
            <button
              className={`flex-1 py-3 text-center font-semibold transition-all duration-300 ${activeTab === 'register'
                ? 'text-streamflow-cyan border-b-2 border-streamflow-cyan shadow-[0_4px_10px_-4px_rgba(0,255,255,0.4)]'
                : 'text-gray-400 hover:text-white'
                }`}
              onClick={() => {
                setActiveTab('register');
                setError('');
              }}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
              {error}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label htmlFor="login-username" className="block text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  id="login-username"
                  type="text"
                  className="input-field"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  disabled={loading}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="login-password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full mb-4"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-gray-400 hover:text-streamflow-cyan transition-all duration-300"
                  onClick={() => navigate('/recover')}
                >
                  Forgot password?
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="mb-4">
                <label htmlFor="register-username" className="block text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  id="register-username"
                  type="text"
                  className="input-field"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="register-password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  className="input-field"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a password (min 8 characters)"
                  disabled={loading}
                />
              </div>

              <div className="mb-6">
                <label htmlFor="register-confirm" className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  id="register-confirm"
                  type="password"
                  className="input-field"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>

      <Dialog
        open={showRecoveryCodes}
        onClose={() => { }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/75" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-lg card glass-panel p-6 border-white/10">
            <Dialog.Title className="text-2xl font-black text-streamflow-cyan mb-4 tracking-tight" style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.4))' }}>
              Save Your Recovery Codes
            </Dialog.Title>

            <div className="mb-4 p-3 bg-yellow-900/50 border border-yellow-700 rounded text-yellow-200 text-sm">
              <strong>Important:</strong> Save these codes in a secure place. You will need one of them to recover your account if you forget your password.
            </div>

            <div className="bg-gray-800 rounded p-4 mb-6">
              <ul className="space-y-2 font-mono text-sm">
                {recoveryCodes.map((code, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-gray-400 mr-3">{index + 1}.</span>
                    <span className="text-white">{code}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                className="btn-secondary flex-1"
                onClick={() => {
                  const codesText = recoveryCodes.join('\n');
                  navigator.clipboard.writeText(codesText);
                }}
              >
                Copy to Clipboard
              </button>
              <button
                className="btn-primary flex-1"
                onClick={handleRecoveryCodesClose}
              >
                I&apos;ve Saved Them
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default Login;
