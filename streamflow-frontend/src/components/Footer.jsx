const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-streamflow-navy border-t border-white/5 mt-16 backdrop-blur-md">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            &copy; {currentYear} StreamFlow. All rights reserved.
          </p>

          <p className="text-gray-600 text-xs mt-4">
            Content metadata provided by TMDB. Streaming powered by Vidsrc.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
