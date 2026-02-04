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
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-streamflow-blue/20 blur-[150px] rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-streamflow-cyan/20 blur-[150px] rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full max-h-screen bg-streamflow-cyan/[0.02] blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[420px] relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-10">
          <img
            src="/assets/logo_long.png"
            alt="StreamFlow"
            className="h-10 md:h-12 w-auto mb-4 drop-shadow-[0_0_15px_rgba(0,255,255,0.3)]"
          />
          <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/5 rounded-full backdrop-blur-md">
            <div className="w-1 h-1 rounded-full bg-streamflow-cyan animate-pulse" />
            <span className="text-[10px] font-black text-cyan-100/40 uppercase tracking-[0.2em]">Secure Access Terminal</span>
          </div>
        </div>

        <div className="glass-panel p-8 md:p-10 rounded-3xl border-white/5 shadow-3xl relative overflow-hidden group">
          {/* Internal Glows */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-streamflow-cyan/5 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-streamflow-cyan/10 transition-colors duration-1000" />

          <div className="relative z-10">
            {/* Tabs - Redesigned for compact luxury */}
            <div className="flex mb-8 bg-black/20 p-1.5 rounded-xl border border-white/5">
              <button
                className={`flex-1 py-2 text-center text-[11px] font-black uppercase tracking-widest transition-all duration-500 rounded-lg ${activeTab === 'login'
                  ? 'bg-streamflow-cyan text-streamflow-navy shadow-cyan-glow'
                  : 'text-gray-500 hover:text-white'
                  }`}
                onClick={() => {
                  setActiveTab('login');
                  setError('');
                }}
              >
                Login
              </button>
              <button
                className={`flex-1 py-2 text-center text-[11px] font-black uppercase tracking-widest transition-all duration-500 rounded-lg ${activeTab === 'register'
                  ? 'bg-streamflow-cyan text-streamflow-navy shadow-cyan-glow'
                  : 'text-gray-500 hover:text-white'
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
              <div className="mb-6 p-3 bg-red-900/20 border border-red-500/10 rounded-xl text-red-400 text-[11px] font-bold flex items-center gap-3 animate-shake">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label htmlFor="login-username" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                    Username
                  </label>
                  <input
                    id="login-username"
                    type="text"
                    className="input-field py-3 px-5 text-sm font-bold bg-white/[0.02] border-white/5 focus:border-streamflow-cyan/30 rounded-xl placeholder:text-gray-700"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ENTER CREDENTIALS"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    className="input-field py-3 px-5 text-sm font-bold bg-white/[0.02] border-white/5 focus:border-streamflow-cyan/30 rounded-xl placeholder:text-gray-700"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    disabled={loading}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="btn-primary w-full py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-streamflow-cyan/10 flex items-center justify-center gap-2 group"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-streamflow-navy/20 border-t-streamflow-navy rounded-full animate-spin" />
                    ) : (
                      <>
                        Initiate Sequence
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    className="text-[10px] font-black text-gray-600 hover:text-streamflow-cyan uppercase tracking-widest transition-all duration-300"
                    onClick={() => navigate('/recover')}
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label htmlFor="register-username" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                    Username
                  </label>
                  <input
                    id="register-username"
                    type="text"
                    className="input-field py-3 px-5 text-sm font-bold bg-white/[0.02] border-white/5 focus:border-streamflow-cyan/30 rounded-xl placeholder:text-gray-700"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="CHOOSE IDENTIFIER"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="register-password" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                    Password
                  </label>
                  <input
                    id="register-password"
                    type="password"
                    className="input-field py-3 px-5 text-sm font-bold bg-white/[0.02] border-white/5 focus:border-streamflow-cyan/30 rounded-xl placeholder:text-gray-700"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="MIN 8 CHARACTERS"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="register-confirm" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                    Confirm Password
                  </label>
                  <input
                    id="register-confirm"
                    type="password"
                    className="input-field py-3 px-5 text-sm font-bold bg-white/[0.02] border-white/5 focus:border-streamflow-cyan/30 rounded-xl placeholder:text-gray-700"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="VERIFY ACCESS KEY"
                    disabled={loading}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="btn-primary w-full py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-streamflow-cyan/10 flex items-center justify-center gap-2 group"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-streamflow-navy/20 border-t-streamflow-navy rounded-full animate-spin" />
                    ) : (
                      <>
                        Create Profile
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={showRecoveryCodes}
        onClose={() => { }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/75" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-lg card glass-panel p-6 border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-streamflow-cyan/5 blur-3xl rounded-full" />

            <Dialog.Title className="text-2xl font-black text-white mb-4 tracking-tight uppercase flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-streamflow-cyan animate-pulse" />
              Recovery <span className="text-streamflow-cyan">Protocol</span>
            </Dialog.Title>

            <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/20 rounded-xl text-yellow-200/70 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
              <strong className="text-yellow-500 block mb-1">Critical Security Alert:</strong> These codes are your only way to bypass encryption if you lose your primary access key. Archive them immediately in a secure location.
            </div>

            <div className="bg-black/40 rounded-2xl p-6 mb-6 border border-white/5">
              <ul className="grid grid-cols-2 gap-4 font-mono text-xs uppercase tracking-widest">
                {recoveryCodes.map((code, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="text-gray-600 font-bold">{String(index + 1).padStart(2, '0')}.</span>
                    <span className="text-white font-black">{code}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                className="btn-secondary flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
                onClick={() => {
                  const codesText = recoveryCodes.join('\n');
                  navigator.clipboard.writeText(codesText);
                }}
              >
                Copy to Clipboard
              </button>
              <button
                className="btn-primary flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
                onClick={handleRecoveryCodesClose}
              >
                Protocol Acknowledged
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default Login;
