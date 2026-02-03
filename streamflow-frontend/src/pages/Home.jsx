import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-netflix-black">
      <nav className="bg-netflix-gray-dark shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-netflix-red">StreamFlow</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Welcome, {user?.username}!</span>
            <button onClick={handleLogout} className="btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Welcome to StreamFlow
          </h2>
          <p className="text-gray-400 text-lg">
            Your Netflix-style streaming platform
          </p>
          <div className="mt-8 p-6 bg-netflix-gray-dark rounded-lg max-w-2xl mx-auto">
            <p className="text-gray-300">
              The homepage content with carousels will be implemented in the next step.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
