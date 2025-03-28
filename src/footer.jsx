import React from 'react';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 pt-12 pb-6" id="Footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-4">
              About Profit Predictor
            </h3>
            <p className="text-gray-400 leading-relaxed mb-4">
              We revolutionize financial forecasting by integrating cutting-edge AI and deep learning to predict market trends with precision. Our mission is to empower investors with data-driven insights for informed decision-making.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'Market Analysis', 'Predictions', 'About Us'].map((link) => (
                <li key={link}>
                  <a href={`#${link.replace(' ', '')}`} className="text-gray-400 hover:text-teal-400 transition-colors duration-300">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              {[
                { icon: <Github className="w-5 h-5" />, href: "#" },
                { icon: <Twitter className="w-5 h-5" />, href: "#" },
                { icon: <Linkedin className="w-5 h-5" />, href: "#" },
                { icon: <Mail className="w-5 h-5" />, href: "mailto:contact@profitpredictor.com" }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-gray-400 hover:text-teal-400 transition-colors duration-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              &copy; {currentYear} Profit Predictor. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-teal-400 text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-teal-400 text-sm">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;