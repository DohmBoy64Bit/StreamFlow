import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import { getMovieDetails } from '../services/movies';
import { getTVDetails, getSeasonDetails } from '../services/tv';

const Watch = () => {
  const { type, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [contentTitle, setContentTitle] = useState('');
  const [loading, setLoading] = useState(true);

  const season = searchParams.get('season') ? parseInt(searchParams.get('season')) : undefined;
  const episode = searchParams.get('episode') ? parseInt(searchParams.get('episode')) : undefined;

  useEffect(() => {
    const fetchContentDetails = async () => {
      setLoading(true);
      try {
        if (type === 'movie') {
          const data = await getMovieDetails(id);
          setContentTitle(data.title);
        } else if (type === 'tv') {
          const showData = await getTVDetails(id);
          if (season && episode) {
            const seasonData = await getSeasonDetails(id, season);
            const episodeData = seasonData.episodes?.find(ep => ep.episode_number === episode);
            const episodeTitle = episodeData ? ` - S${season}E${episode}: ${episodeData.name}` : ` - S${season}E${episode}`;
            setContentTitle(`${showData.name}${episodeTitle}`);
          } else {
            setContentTitle(showData.name);
          }
        }
      } catch (err) {
        console.error('Failed to fetch content details:', err);
        setContentTitle('Unknown Content');
      } finally {
        setLoading(false);
      }
    };

    fetchContentDetails();
  }, [type, id, season, episode]);

  const handleBack = () => {
    if (type === 'movie') {
      navigate(`/movie/${id}`);
    } else if (type === 'tv') {
      navigate(`/show/${id}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white hover:text-netflix-red transition"
          >
            <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
          {loading ? (
            <div className="h-8 w-64 bg-gray-700 animate-pulse rounded"></div>
          ) : (
            <h1 className="text-2xl md:text-3xl font-bold text-white">{contentTitle}</h1>
          )}
        </div>

        <VideoPlayer
          tmdbId={id}
          type={type}
          season={season}
          episode={episode}
        />

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Tip: Your watch position is automatically saved every 10 seconds</p>
        </div>
      </div>
    </div>
  );
};

export default Watch;
