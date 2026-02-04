import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to={ROUTES.HOME} className="flex items-center">
            <img src="/assets/logo_long.png" alt="StreamFlow" className="h-8 md:h-10" style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.8))' }} />
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <div className="hidden md:flex items-center gap-6">
            <Link to={ROUTES.HOME} className="text-gray-300 hover:text-streamflow-cyan transition-all duration-300">
              Home
            </Link>
            <Link to={ROUTES.SEARCH} className="text-gray-300 hover:text-streamflow-cyan transition-all duration-300">
              Search
            </Link>
            {isAuthenticated && (
              <>
                <Link to={ROUTES.LISTS} className="text-gray-300 hover:text-streamflow-cyan transition-all duration-300">
                  My Lists
                </Link>
                <Link to={ROUTES.PROFILE} className="text-gray-300 hover:text-streamflow-cyan transition-all duration-300">
                  Profile
                </Link>
                <span className="text-gray-400">|</span>
                <span className="text-gray-300">{user?.username}</span>
                <button onClick={handleLogout} className="btn-secondary">
                  Logout
                </button>
              </>
            )}
            {!isAuthenticated && (
              <Link to={ROUTES.LOGIN} className="btn-primary">
                Login
              </Link>
            )}
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col gap-4">
              <Link
                to={ROUTES.HOME}
                className="text-gray-300 hover:text-white transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to={ROUTES.SEARCH}
                className="text-gray-300 hover:text-white transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Search
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to={ROUTES.LISTS}
                    className="text-gray-300 hover:text-white transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Lists
                  </Link>
                  <Link
                    to={ROUTES.PROFILE}
                    className="text-gray-300 hover:text-white transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <div className="border-t border-white/10 pt-4">
                    <span className="text-gray-300 block mb-2">{user?.username}</span>
                    <button onClick={handleLogout} className="btn-secondary w-full">
                      Logout
                    </button>
                  </div>
                </>
              )}
              {!isAuthenticated && (
                <Link
                  to={ROUTES.LOGIN}
                  className="btn-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
