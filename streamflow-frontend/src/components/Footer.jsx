const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-netflix-gray-dark border-t border-gray-800 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            &copy; {currentYear} StreamFlow. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="#" className="text-gray-500 hover:text-gray-300 transition">
              Terms of Service
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-300 transition">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-300 transition">
              Contact
            </a>
          </div>
          <p className="text-gray-600 text-xs mt-4">
            Content metadata provided by TMDB. Streaming powered by Vidsrc.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
