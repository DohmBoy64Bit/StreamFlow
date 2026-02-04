import PropTypes from 'prop-types';

const ErrorMessage = ({ message, onRetry, className = '' }) => {
  return (
    <div className={`bg-red-900 bg-opacity-50 border border-red-700 text-white px-4 py-3 rounded-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <p>{message}</p>
        </div>
        {onRetry && (
          <button onClick={onRetry} className="btn-secondary ml-4 px-4 py-2 text-sm">
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
  className: PropTypes.string,
};

export default ErrorMessage;
