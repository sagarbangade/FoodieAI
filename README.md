# Foodie AI Chatbot 🍔🍕

## Demo Video:  https://youtu.be/SmE4yztsglg
## Demo Website (Live): https://foodie-ai-beta.vercel.app/


<!-- Replace the image link above with a thumbnail image for your demo video, and replace LINK-TO-YOUR-DEMO-VIDEO with the actual YouTube or video platform link.
     Replace LINK-TO-YOUR-DEMO-WEBSITE with the link to your deployed website (if you have one).
     If you don't have a demo video or website yet, you can leave these placeholders and add them later. -->

## Project Overview

Foodie AI Chatbot is a conversational web application designed to help users discover delicious food options, focusing on nearby restaurants and personalized dietary preferences. Powered by Google's advanced AI models and location services, Foodie AI acts as your friendly, food-savvy assistant, ready to provide recommendations, even when real-time data is unavailable.

**Key Features:**

*   **AI-Powered Conversations:**  Engages in natural language conversations using Google's Gemini AI model, providing helpful and relevant responses to user queries about food.
*   **Nearest Restaurant Recommendations:** Suggests the top 5 nearest restaurants based on the user's current location, leveraging Google Maps Platform APIs.
*   **Dietary Preference Selection:** Allows users to easily select their dietary preference (Vegetarian, Non-vegetarian, Vegan) via a visually appealing toggle interface, influencing restaurant recommendations and chatbot tone.
*   **Location Awareness:**
    *   Automatically detects the user's current location using the browser's Geolocation API.
    *   Displays the user's location name in the header, fetched using Google Maps Geocoding API.
    *   Provides a search box powered by Google Maps Places Autocomplete to enable users to easily change their location and explore restaurants in different areas.
*   **Voice Input & Output:**
    *   Supports voice input using Google Cloud Speech-to-Text API, allowing users to speak their queries.
    *   Provides voice output for chatbot responses using Google Cloud Text-to-Speech API, enhancing accessibility and user experience.
    *   Includes a visualizer to accompany voice output.
*   **Chat History Management:**  Maintains chat history within the browser's local storage, allowing users to revisit past conversations across sessions.
*   **Themed UI:** Features a responsive and visually engaging user interface with themed toggle buttons for dietary preferences (Heavenly Veg/Vegan, Hellish Non-veg).
*   **Bluffing Capability:** When real-time restaurant data is unavailable, the AI is designed to confidently "bluff" by inventing plausible restaurant details, ensuring a seamless user experience even in data-scarce scenarios.
*   **Dynamic Tone:** The chatbot's conversational tone adapts based on the user's dietary preference, being more enthusiastic for Veg/Vegan users and adopting a subtly reluctant but helpful tone for Non-veg users.
*   **Creator Information:**  Creator details (Sagar Eknath Bangade) are revealed when users inquire about the chatbot's origin.

## Technologies Used

*   **Frontend:**
    *   [React.js](https://reactjs.org/) - JavaScript library for building user interfaces.
    *   [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework for styling.
    *   [@react-google-maps/api](https://react-google-maps-api.netlify.app/) - React wrapper for Google Maps JavaScript API.
    *   [lucide-react](https://lucide.dev/) - Beautifully simple icons.
    *   [react-markdown](https://github.com/remarkjs/react-markdown) - React component to render Markdown.
    *   [remark-gfm](https://github.com/remarkjs/remark-gfm) - Remark plugin to support GitHub Flavored Markdown.

*   **Backend & AI:**
    *   [Google Generative AI (Gemini API)](https://ai.google.dev/) - For conversational AI capabilities.
    *   [Google Cloud Text-to-Speech API](https://cloud.google.com/text-to-speech) - For voice output.
    *   [Google Cloud Speech-to-Text API](https://cloud.google.com/speech-to-text) - For voice input.
    *   [Google Maps Platform APIs](https://developers.google.com/maps/apis-by-context/platform)
        *   [Places API (Autocomplete, Nearby Search, Place Details)](https://developers.google.com/maps/documentation/places/web-service/overview) - For location search and restaurant data.
        *   [Geocoding API](https://developers.google.com/maps/documentation/geocoding/overview) - For reverse geocoding (location name from coordinates).

*   **Authentication (Optional - if used in your demo):**
    *   [Firebase Authentication](https://firebase.google.com/docs/auth) - For user sign-in with Google (if implemented).

*   **Other:**
    *   [Vite](https://vitejs.dev/) - For fast development server and build tool.
    *   [dotenv](https://www.npmjs.com/package/dotenv) (via Vite) - For managing environment variables.

## Setup Instructions (Local Development)

1.  **Clone the repository:**

    ```bash
    git clone [repository-url]
    cd [foodie-ai-chatbot-folder]
    ```

    *(Replace `[repository-url]` with the actual URL of your GitHub repository and `[foodie-ai-chatbot-folder]` with the name of the cloned folder.)*

2.  **Install dependencies:**

    ```bash
    npm install  # or yarn install
    ```

3.  **Create `.env.local` file:**

    In the project root directory, create a file named `.env.local` and add your API keys and Firebase configuration variables.  **Ensure you replace the placeholder values with your actual API keys from Google Cloud Console and Firebase Console.**

    ```
    VITE_GEMINI_API_KEY='YOUR_GEMINI_API_KEY'
    VITE_GOOGLE_CLOUD_API_KEY='YOUR_GOOGLE_CLOUD_API_KEY'

    # Firebase Configuration (if using Firebase Authentication)
    VITE_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
    VITE_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
    VITE_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
    VITE_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
    VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
    VITE_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
    VITE_FIREBASE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID"

    # Google Cloud Service Account Keys (if needed for backend services, adjust as necessary)
    # VITE_GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
    # VITE_GOOGLE_CLIENT_EMAIL="YOUR_SERVICE_ACCOUNT_CLIENT_EMAIL"
    ```

    **Important:**  **Never commit your `.env.local` file to version control** as it contains sensitive API keys. It's included in `.gitignore` to prevent accidental commits.

4.  **Run the development server:**

    ```bash
    npm run dev  # or yarn dev
    ```

    Open your browser and navigate to `http://localhost:5173` (or the address shown in your terminal) to access the Foodie AI Chatbot.

## Deployment (Optional)

To deploy your Foodie AI Chatbot to the web, you can use platforms like:

*   [Netlify](https://www.netlify.com/)
*   [Vercel](https://vercel.com/)
*   [Firebase Hosting](https://firebase.google.com/docs/hosting)

These platforms offer easy deployment for React applications, and you can configure environment variables in their settings to securely manage your API keys in a production environment. Refer to the documentation of your chosen platform for specific deployment instructions.

## Credits

**Created by: Sagar Eknath Bangade**

*   Email: [sagar.bangade.dev@gmail.com](mailto:sagar.bangade.dev@gmail.com)
*   Portfolio: [sagar.skillsfoster.com](https://sagar.skillsfoster.com)

## License

[MIT License](LICENSE) *(Optional: Add a LICENSE file with MIT License text if you want to use the MIT License)*

---

**Enjoy your Foodie AI Chatbot!** 🍽️
