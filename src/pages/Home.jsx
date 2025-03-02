import Footer from "../components/Footer";
import LandingPageNavbar from "../components/LandingPageNavbar";
import { PlayCircleIcon } from "lucide-react"; // Assuming you have lucide-react icons installed

const HomePage = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <LandingPageNavbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-blue-100 to-blue-300 dark:from-gray-800 dark:to-gray-700">
          <div className="container mx-auto px-4 md:px-8 lg:px-16 flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 mb-10 lg:mb-0 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Whispers the
                <br></br>
                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Best Bites.
              </h1>
              <p className="text-lg mb-8 text-gray-700 dark:text-gray-300">
                Discover the top 5 dishes from the best restaurants near you,
                all with the power of voice. No more endless scrolling, just
                delicious recommendations.
              </p>
              <button className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-colors duration-300 flex items-center mx-auto lg:mx-0">
                <PlayCircleIcon className="mr-2 h-6 w-6" /> Try Voice Search
              </button>
            </div>
            <div className="lg:w-1/2">
              <img
                src="/logo2.png" // Replace with your hero image or illustration in public/images
                alt="Foodie AI Voice Search"
                className="rounded-lg shadow-xl mx-auto lg:mr-0"
                style={{ width:"350px"}}
              />
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-16 bg-gray-100 dark:bg-gray-800">
          <div className="container mx-auto px-4 md:px-8 lg:px-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">
              How Foodie AI Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="bg-blue-200 dark:bg-blue-800 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-blue-700 dark:text-blue-200">
                    1
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Voice Your Craving
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Simply tell Foodie AI what you're in the mood for. "Find me
                  Italian near me," or "Suggest something spicy."
                </p>
              </div>
              {/* Step 2 */}
              <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="bg-blue-200 dark:bg-blue-800 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-blue-700 dark:text-blue-200">
                    2
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Magic Happens</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Our AI analyzes nearby restaurants and their menus to identify
                  the top-rated dishes based on reviews and popularity.
                </p>
              </div>
              {/* Step 3 */}
              <div className="p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="bg-green-200 dark:bg-green-800 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-green-700 dark:text-green-200">
                    3
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Get Top 5 Picks</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Foodie AI presents you with the top 5 dishes from the nearest
                  restaurants, making your choice deliciously easy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 md:px-8 lg:px-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-semibold mb-2">
                  Voice-Powered Search
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Effortlessly find food recommendations using just your voice.
                  Quick, intuitive, and hands-free.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-semibold mb-2">
                  Top 5 Dish Suggestions
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Say goodbye to decision fatigue. We curate the top 5 dishes so
                  you can choose confidently.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-semibold mb-2">
                  Nearest Restaurants
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Discover great food nearby. Foodie AI focuses on restaurants
                  in your vicinity for relevant recommendations.
                </p>
              </div>
              {/* Feature 4 */}
              <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-semibold mb-2">
                  Personalized Recommendations
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  (Future Feature) - Learn your preferences over time to offer
                  even more tailored suggestions.
                </p>
              </div>
              {/* Feature 5 */}
              <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-semibold mb-2">
                  Explore Diverse Cuisines
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  From Italian to Thai, explore a wide range of cuisines in your
                  local area.
                </p>
              </div>
              {/* Feature 6 */}
              <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-semibold mb-2">
                  Save Time & Effort
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Stop wasting time browsing menus. Get straight to the best
                  dishes with Foodie AI.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
export default HomePage;
