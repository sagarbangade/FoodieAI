import { Link } from "react-router-dom"; // Import Link
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"; // Example social icons

const Footer = () => {
  return (
    <>
    <footer className="bg-gray-950 text-gray-300 py-10 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Logo and Description */}
          <div className="ml-5">
            <div className="flex  items-center space-x-2 sm:space-x-3 mb-4">
              
              <Link
                to="/"
                className="text-white text-xl sm:text-2xl font-semibold hover:text-blue-400 transition duration-300"
              >
                <img
                src="/logo.png"
                alt="ShinobiPath Logo"
                className="h-25 mr-2 slow-spin"
              />
              </Link>
            </div>
            <p className="text-sm sm:text-base">
            Voice assistant who can suggest top 5 items from nearest restaurants.
            </p>
            {/* Social Media Icons */}
            <div className="flex mt-4 space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-blue-500 transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-500 transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-500 transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-500 transition-colors"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h4 className="text-blue-400 font-semibold mb-4 text-base sm:text-lg">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <Link
                      to={link.url} // Use link.url for dynamic routes
                      className="text-sm sm:text-base hover:text-blue-500 transition-colors"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-8 sm:mt-10 border-t border-gray-700 pt-4 sm:pt-6 text-center text-sm sm:text-base">
          © {new Date().getFullYear()} Foodie AI. All rights reserved.
        </div>
      </div>
    </footer>
    </>
  );
};

const footerLinks = [
  {
    title: "Company",
    links: [
      { text: "About Us", url: "/about" },
      { text: "Careers", url: "/careers" },
      { text: "Press", url: "/press" },
      { text: "Contact", url: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { text: "Blog", url: "/blog" },
      { text: "Help Center", url: "/help" },
      { text: "Community", url: "/community" },
      { text: "Partners", url: "/partners" },
    ],
  },
  {
    title: "Legal",
    links: [
      { text: "Privacy Policy", url: "/privacy" },
      { text: "Terms of Service", url: "/terms" },
      { text: "Cookie Policy", url: "/cookies" },
    ],
  },
];

export default Footer;
