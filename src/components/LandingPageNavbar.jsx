import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const LandingPageNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Breakpoints (Tailwind's default breakpoints) ---
  const breakpoints = {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50  transition-all duration-300 ${
        isScrolled ? "bg-gray-900 shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center ">
        {/* Logo/Brand Name */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          <NavLink
            to="/"
            className="text-white text-xl sm:text-2xl lg:text-3xl font-semibold hover:text-orange-400 transition duration-300"
          >
            <img
            src="/logo.png"
            alt="ShinobiPath Logo"
            className="h-25 mr-2 slow-spin"
          />
          </NavLink>
        </div>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex space-x-4 lg:space-x-8 text-white font-medium text-base lg:text-lg items-center">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `hover:text-orange-600 transition duration-300 ${
                isActive ? "text-orange-800" : ""
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `hover:text-orange-600 transition duration-300 ${
                isActive ? "text-orange-800" : ""
              }`
            }
          >
            About
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `hover:text-orange-600 transition duration-300 ${
                isActive ? "text-orange-800" : ""
              }`
            }
          >
            Contact
          </NavLink>
          <Link
            to="/login"
            className="bg-orange-600 text-white px-4 sm:px-6 py-2 rounded-full hover:bg-orange-700 transition duration-300"
          >
            Log in
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-white hover:text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed top-0 left-0 w-full h-screen bg-gray-900 z-40">
            {/* Close Button (inside the mobile menu) */}
            <button
              onClick={toggleMobileMenu}
              className="absolute top-4 right-4 text-white hover:text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center justify-center h-full">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `text-white hover:text-orange-400 transition duration-300 block px-4 py-3 text-xl ${
                    isActive ? "text-orange-400" : ""
                  }`
                }
                onClick={toggleMobileMenu}
              >
                Home
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `text-white hover:text-orange-400 transition duration-300 block px-4 py-3 text-xl ${
                    isActive ? "text-orange-400" : ""
                  }`
                }
                onClick={toggleMobileMenu}
              >
                About
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `text-white hover:text-orange-400 transition duration-300 block px-4 py-3 text-xl ${
                    isActive ? "text-orange-400" : ""
                  }`
                }
                onClick={toggleMobileMenu}
              >
                Contact
              </NavLink>
              <Link
                to="/login"
                className="bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 transition duration-300 block mt-2"
                onClick={toggleMobileMenu}
              >
                Log in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPageNavbar;
