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
    <nav className="bg-netflix-gray-dark shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to={ROUTES.HOME} className="flex items-center">
            <img src="/assets/logo.jpg" alt="StreamFlow" className="h-12 md:h-14" />
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
            <Link to={ROUTES.HOME} className="text-gray-300 hover:text-white transition">
              Home
            </Link>
            <Link to={ROUTES.SEARCH} className="text-gray-300 hover:text-white transition">
              Search
            </Link>
            {isAuthenticated && (
              <>
                <Link to={ROUTES.LISTS} className="text-gray-300 hover:text-white transition">
                  My Lists
                </Link>
                <Link to={ROUTES.PROFILE} className="text-gray-300 hover:text-white transition">
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
          <div className="md:hidden mt-4 pb-4 border-t border-gray-700 pt-4">
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
                  <div className="border-t border-gray-700 pt-4">
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
