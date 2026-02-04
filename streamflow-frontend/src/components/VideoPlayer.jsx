import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getPlayerUrl } from '../services/vidsrc';
import { saveWatchPosition, getResumePosition } from '../services/watch';

const VideoPlayer = ({ tmdbId, type, season, episode, onError }) => {
  const [playerData, setPlayerData] = useState(null);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const positionIntervalRef = useRef(null);
  const currentPositionRef = useRef(0);

  const mediaType = type === 'movie' ? 'movie' : 'tv';

  const fetchPlayerData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getPlayerUrl(tmdbId, type, season, episode);
      setPlayerData(data);
      setCurrentUrlIndex(0);
    } catch (err) {
      setError('Failed to load player. Please try again.');
      console.error('Player URL error:', err);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  }, [tmdbId, type, season, episode, onError]);

  const fetchResumePosition = useCallback(async () => {
    try {
      const data = await getResumePosition(tmdbId, mediaType, season, episode);
      if (data && data.last_position) {
        currentPositionRef.current = data.last_position;
      }
    } catch (err) {
      console.error('Failed to fetch resume position:', err);
    }
  }, [tmdbId, mediaType, season, episode]);

  const savePosition = useCallback(async () => {
    const position = currentPositionRef.current;
    if (position > 0) {
      try {
        await saveWatchPosition(tmdbId, mediaType, season, episode, position);
      } catch (err) {
        console.error('Failed to save watch position:', err);
      }
    }
  }, [tmdbId, mediaType, season, episode]);

  useEffect(() => {
    fetchPlayerData();
    fetchResumePosition();

    const handleBeforeUnload = () => {
      savePosition();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
      }
      savePosition();
    };
  }, [fetchPlayerData, fetchResumePosition, savePosition]);

  useEffect(() => {
    if (positionIntervalRef.current) {
      clearInterval(positionIntervalRef.current);
    }

    positionIntervalRef.current = setInterval(() => {
      currentPositionRef.current += 10;
      savePosition();
    }, 10000);

    return () => {
      if (positionIntervalRef.current) {
        clearInterval(positionIntervalRef.current);
      }
    };
  }, [savePosition]);

  const handleIframeError = () => {
    if (playerData?.fallback_urls && currentUrlIndex < playerData.fallback_urls.length - 1) {
      setCurrentUrlIndex(currentUrlIndex + 1);
    } else {
      setError('All player sources failed to load. Please try again later.');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center rounded-lg">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-streamflow-cyan border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white">Loading player...</p>
        </div>
      </div>
    );
  }

  if (error || !playerData) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center rounded-lg">
        <div className="text-center px-4">
          <p className="text-red-500 text-lg mb-2">⚠️ {error || 'Unable to load player'}</p>
          <button onClick={fetchPlayerData} className="btn-primary px-6 py-2">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentUrl = currentUrlIndex === 0
    ? playerData.primary_url
    : playerData.fallback_urls[currentUrlIndex - 1];

  return (
    <div ref={containerRef} className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <iframe
        ref={iframeRef}
        src={currentUrl}
        className="w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        onError={handleIframeError}
        title="Video Player"
      />

      <button
        onClick={toggleFullscreen}
        className="absolute bottom-4 right-4 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-3 rounded-lg transition z-10"
        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? (
          <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        )}
      </button>
    </div>
  );
};

VideoPlayer.propTypes = {
  tmdbId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  type: PropTypes.oneOf(['movie', 'tv']).isRequired,
  season: PropTypes.number,
  episode: PropTypes.number,
  onError: PropTypes.func,
};

export default VideoPlayer;
