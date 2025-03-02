import Footer from "../components/Footer";
import LandingPageNavbar from "../components/LandingPageNavbar";
import { ChefHatIcon, BrainIcon, MapPinIcon } from 'lucide-react'; // Assuming you have lucide-react icons

const About = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <LandingPageNavbar />

      <main className="flex-grow py-20">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <section className="mb-16">
            <h2 className="text-4xl font-bold mb-8 text-center">About </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Foodie AI is your intelligent voice assistant for discovering the best food around you. We understand that choosing what to eat can be overwhelming. That's why we've harnessed the power of Artificial Intelligence to simplify your dining decisions.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              Using advanced algorithms and natural language processing, Foodie AI listens to your cravings and quickly identifies the top 5 dishes from restaurants near you. We analyze restaurant reviews, menu popularity, and location data to bring you delicious, relevant recommendations, all through a simple voice interaction.
            </p>
          </section>

          <section className="mb-16">
            <h3 className="text-3xl font-bold mb-8 text-center">Why Foodie AI?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Benefit 1 */}
              <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-center">
                <ChefHatIcon className="h-10 w-10 text-blue-500 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Curated Recommendations</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Get hand-picked top 5 dishes, saving you time and ensuring a great dining experience.
                </p>
              </div>
              {/* Benefit 2 */}
              <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-center">
                <BrainIcon className="h-10 w-10 text-blue-500 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">AI-Powered Intelligence</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Leveraging cutting-edge AI to understand your needs and provide smart, relevant suggestions.
                </p>
              </div>
              {/* Benefit 3 */}
              <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-center">
                <MapPinIcon className="h-10 w-10 text-green-500 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Local Focus</h4>
                <p className="text-gray-700 dark:text-gray-300">
                  Discover hidden gems and popular spots in your neighborhood, supporting local businesses.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-3xl font-bold mb-8 text-center">Our Mission</h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center">
              Our mission is to make dining decisions simple, enjoyable, and always delicious. We believe that everyone deserves to easily find great food, and Foodie AI is our way of making that happen.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;