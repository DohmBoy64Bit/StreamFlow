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
      <div className="min-h-screen bg-streamflow-navy flex items-center justify-center px-4 relative overflow-hidden font-outfit">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-streamflow-blue/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-streamflow-cyan/20 blur-[150px] rounded-full" />
        <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
          <div className="glass-panel p-10 text-center rounded-3xl border-white/5 shadow-3xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl rounded-full" />

            <div className="mb-8 relative">
              <div className="mx-auto h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-black text-white mb-2 tracking-tight uppercase">Protocol <span className="text-green-500">Success</span></h2>
            <p className="text-gray-500 text-[11px] font-bold uppercase tracking-[0.2em] leading-relaxed">
              Your access credentials have been successfully re-encrypted. Redirecting to secure terminal...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-streamflow-navy flex items-center justify-center px-4 relative overflow-hidden font-outfit">
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
            <span className="text-[10px] font-black text-cyan-100/40 uppercase tracking-[0.2em]">Credential Recovery</span>
          </div>
        </div>

        <div className="glass-panel p-8 md:p-10 rounded-3xl border-white/5 shadow-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-streamflow-cyan/5 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-streamflow-cyan/10 transition-colors duration-1000" />

          <div className="relative z-10">
            <h2 className="text-xs font-black text-white mb-6 uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-4 h-px bg-streamflow-cyan" />
              Reset Password
            </h2>

            {error && (
              <div className="mb-6 p-3 bg-red-900/20 border border-red-500/10 rounded-xl text-red-400 text-[11px] font-bold flex items-center gap-3 animate-shake">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div className="mb-6 p-4 bg-streamflow-blue/20 border border-streamflow-blue/10 rounded-xl text-cyan-200/50 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              Verify your identity using your username and a recovery code.
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  className="input-field py-3 px-5 text-sm font-bold bg-white/[0.02] border-white/5 focus:border-streamflow-cyan/30 rounded-xl placeholder:text-gray-700"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="IDENTIFIER"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="recovery-code" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                  Recovery Code
                </label>
                <input
                  id="recovery-code"
                  type="text"
                  className="input-field py-3 px-5 text-sm font-bold font-mono bg-white/[0.02] border-white/5 focus:border-streamflow-cyan/30 rounded-xl placeholder:text-gray-700"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value)}
                  placeholder="AUTH-CODE-XXXX"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="new-password" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    className="input-field py-3 px-5 text-sm font-bold bg-white/[0.02] border-white/5 focus:border-streamflow-cyan/30 rounded-xl placeholder:text-gray-700"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">
                    Confirm
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    className="input-field py-3 px-5 text-sm font-bold bg-white/[0.02] border-white/5 focus:border-streamflow-cyan/30 rounded-xl placeholder:text-gray-700"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
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
                      Reset Password
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
                  className="text-[10px] font-black text-gray-600 hover:text-streamflow-cyan uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 mx-auto group"
                  onClick={() => navigate('/login')}
                >
                  <svg className="w-3 h-3 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                  Return to Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recover;
