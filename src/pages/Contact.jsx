import Footer from "../components/Footer";
import LandingPageNavbar from "../components/LandingPageNavbar";
import { MailIcon, PhoneIcon, MapIcon } from 'lucide-react'; // Assuming you have lucide-react icons

const Contact = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <LandingPageNavbar />

      <main className="flex-grow py-20">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <section className="mb-16 text-center">
            <h2 className="text-4xl font-bold mb-8 mt-10">Contact Us</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              We'd love to hear from you! For any inquiries, feedback, or support requests, please reach out to us using the information below.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-2xl font-semibold mb-6 text-center">Contact Information</h3>
              <div className="flex items-center mb-4">
                <MailIcon className="h-6 w-6 text-orange-500 mr-4" />
                <p className="text-gray-700 dark:text-gray-300">Email: <a href="mailto:support@foodieai.com" className="text-orange-600 dark:text-orange-400 hover:underline">support@foodieai.com</a></p>
              </div>
              <div className="flex items-center mb-4">
                <PhoneIcon className="h-6 w-6 text-blue-500 mr-4" />
                <p className="text-gray-700 dark:text-gray-300">Phone: +1-555-FOOD-AI</p>
              </div>
              <div className="flex items-center">
                <MapIcon className="h-6 w-6 text-green-500 mr-4" />
                <p className="text-gray-700 dark:text-gray-300">Address: 123 Main Street, Foodie City, USA</p>
              </div>
            </div>

            {/* Contact Form (Basic - No Backend) */}
            <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-2xl font-semibold mb-6 text-center">Send us a Message</h3>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Your Name</label>
                  <input type="text" id="name" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-orange-500 dark:focus:border-orange-500 dark:shadow-sm-light" placeholder="Your Name" required />
                </div>
                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Your Email</label>
                  <input type="email" id="email" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-orange-500 dark:focus:border-orange-500 dark:shadow-sm-light" placeholder="name@example.com" required />
                </div>
                <div>
                  <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Your Message</label>
                  <textarea id="message" rows="4" className="block p-2.5 w-full text-sm text-gray-900 dark:text-white bg-gray-50 shadow-sm border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-orange-500 dark:focus:border-orange-500" placeholder="Leave your message..."></textarea>
                </div>
                <button type="submit" className="py-3 px-5 text-sm font-medium text-center text-white bg-orange-600 dark:bg-orange-500 rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-orange-300 dark:focus:ring-orange-800">Send message</button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;