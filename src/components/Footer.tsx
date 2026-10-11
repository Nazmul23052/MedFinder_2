import { Link } from 'react-router-dom';
import { Pill, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
              <Pill className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-white">MedFinder</span>
          </div>
          <p className="text-sm flex items-center gap-1.5">
            Find your medicine, nearby. Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-current" /> for healthier communities.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/search" className="hover:text-teal-400 transition-colors">Search</Link>
            <Link to="/login" className="hover:text-teal-400 transition-colors">Sign In</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
