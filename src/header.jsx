import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header({ activeTab, onTabChange }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-12 h-12 rounded-full ring-2 ring-teal-500 transition-transform duration-300 hover:scale-110" 
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {["Home", "Market", "About Us"].map((item) => (
              <a
                key={item}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onTabChange(item);
                }}
                className={`text-gray-300 px-3 py-2 text-sm font-medium transition-colors duration-300 rounded-md 
                  ${activeTab === item 
                    ? 'text-teal-400 bg-gray-800' 
                    : 'hover:text-teal-400 hover:bg-gray-800'
                  }`}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {["Home", "Market", "About Us"].map((item) => (
                <a
                  key={item}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onTabChange(item);
                    setIsMenuOpen(false);
                  }}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300
                    ${activeTab === item 
                      ? 'text-teal-400 bg-gray-800' 
                      : 'text-gray-300 hover:text-teal-400 hover:bg-gray-800'
                    }`}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
