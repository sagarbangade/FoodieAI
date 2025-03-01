
# ShinobiPath - Travel Itinerary Planner

## Introduction

ShinobiPath is a comprehensive travel itinerary planner designed to empower users to create, manage, and share detailed travel plans.  This application helps users organize every aspect of their trips, from destination research and scheduling activities to budgeting and collaborating with travel companions. ShinobiPath aims to make travel planning as seamless and enjoyable as the journey itself, providing a robust suite of tools within a user-friendly interface.

## Project Type

Frontend with Firebase Backend



## Deployed App
Frontend: [**[Frontend Deployed Link Here]**](https://shinobi-path-itinerary-planner.vercel.app/) - 
Backend: Firebase - *Backend services are provided by Firebase.*
Database: Firebase Firestore - *Database is hosted on Firebase Firestore.*

## Directory Structure

```
shinobipath-itinerary-planner/
├── src/
│   ├── components/        # Reusable React components (Navbar, Footer, Chatbot, etc.)
│   ├── contexts/          # React Contexts for state management (ChatbotContext, ItineraryDataContext)
│   ├── firebase/          # Firebase configuration and utility functions
│   ├── pages/             # Main application pages (Home, Login, Dashboard, ItineraryPlanner, Map, etc.)
│   ├── routes/            # Route definitions (ProtectedRoute)
│   ├── scss/              # SCSS Stylesheets (e.g., chat.css)
│   ├── assets/            # Static assets (images, logos)
│   ├── App.js             # Main application component
│   ├── index.css          # Global CSS styles
│   ├── index.js           # Entry point of the application
│   └── ...
├── public/            # Public assets (logo, images for landing page)
├── vite.config.js       # Vite configuration file
├── package.json
├── package-lock.json
├── readme.md            # This README file
└── ...
```

## Video Walkthrough of the project

[**[Project Feature Walkthrough Video Link Here]**](https://youtu.be/C7m0yvJqfyg) - 

## Video Walkthrough of the codebase

[**[Codebase Walkthrough Video Link Here]**](https://youtu.be/KgsMYd_JAO4) - 

## Features

- **Itinerary Planning:** Create, edit, and manage travel itineraries with titles, descriptions, dates, budgets, and categories.
- **Destination Management:** Add multiple destinations to itineraries, including location search using Google Maps, dates, activities, expenses, and reminders. Reorder destinations using drag and drop.
- **Interactive Maps:** Visualize itineraries and destinations on integrated Google Maps, including location markers and distance calculations between destinations.
- **Budgeting & Expense Tracking:** Set budgets for itineraries and track expenses and activity costs for each destination. Visualize budget vs. expenses with charts.
- **Activity & Reminder Scheduling:** Plan activities and set reminders for each destination with dates and times.
- **Collaborative Planning:** Share itineraries with other users for collaborative planning and editing.
- **User Authentication:** Secure user accounts with Google Sign-in via Firebase Authentication.
- **Dashboard Overview:**  Get a summary of travel activity, including upcoming trips, completed trips, total expenses, visited locations, and key travel statistics visualized through charts and maps.
- **AI-Powered Chatbot Assistant:**  Integrated chatbot powered by Google Gemini API to assist users with travel planning and answer itinerary-related questions.
- **User Profile Management:**  Edit user profile information including personal details, social media links, emergency contacts, travel preferences, and passport information.
- **Calendar Integration:** Calendar view to visualize itinerary dates and events, helping users see their plans in a timeline format.
- **Printable Itineraries:** Generate printable versions of itineraries for offline access and sharing.
- **Search & Filtering:** Search and filter itineraries by title, description, and category.

## Design Decisions or Assumptions

- **React Frontend:** The application is built using React for a dynamic and responsive user interface.
- **Material UI (MUI):**  Utilizes Material UI for consistent UI components and styling, providing a professional and accessible design.
- **Firebase Backend:** Leverages Firebase for authentication (Google Sign-in), Firestore database for storing user data and itineraries, and Firebase Storage for profile picture uploads. This choice simplifies backend development and deployment.
- **Google Maps Platform:**  Integrates Google Maps APIs for map display, location search (Places API), and distance calculations (Distance Matrix API), providing rich location-based functionality.
- **Google Gemini API for Chatbot:** Implements Google's Gemini AI model to provide intelligent and context-aware assistance to users for travel planning within the application.
- **Context API for State Management:** React's Context API is used for managing application-wide state, such as chatbot state and itinerary data, promoting efficient data sharing between components.
- **Drag and Drop Interface:** Implements drag and drop functionality using `react-beautiful-dnd` to allow users to easily reorder destinations and items within itineraries, enhancing user experience.
- **Responsive Design:** The application is designed to be responsive and accessible across different devices (desktop and mobile), using media queries and responsive UI frameworks like Material UI and Tailwind CSS.

## Installation & Getting started

To run this project locally, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone [repository-url] # Replace with your repository URL
    cd shinobipath-itinerary-planner
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up Firebase:**
    *   Create a Firebase project on the [Firebase Console](https://console.firebase.google.com/).
    *   Enable Google Sign-in in your Firebase project's Authentication settings.
    *   Create a Firestore database in your Firebase project.
    *   Obtain your Firebase project configuration (API key, authDomain, projectId, etc.) from the Firebase console (Project settings -> General -> Web apps).
    *   Replace the placeholder values in `src/firebase/firebaseConfig.js` with your Firebase project configuration.

4.  **Set up Google Maps API Key:**
    *   Obtain a Google Maps API key with the Places API, Maps JavaScript API, and Distance Matrix API enabled from the [Google Cloud Console](https://console.cloud.google.com/).
    *   Replace the placeholder API key value `"YOUR_API_KEY"` in `src/pages/Map.js` and other components using Google Maps APIs with your actual Google Maps API key.
    *   Ensure billing is enabled for your Google Cloud project as required by Google Maps Platform.

5.  **Set up Google Gemini API Key:**
    *   Obtain a Google Gemini API key from [Google AI Studio](https://makersuite.google.com/).
    *   Replace the placeholder API key value `"YOUR_API_KEY"` in `src/contexts/ChatbotContext.jsx` and `src/components/Chatbot.jsx` with your actual Gemini API key.

6.  **Start the development server:**

    ```bash
    npm run dev
    ```

7.  Open your browser and navigate to `http://localhost:5173` (or the address shown in your terminal).

## Usage

1.  **Login:**  Use the "Log in" button on the landing page or navigate to `/login` to sign in with your Google account.
2.  **Dashboard:** After logging in, you will be redirected to the dashboard (`/dashboard`), where you can see a summary of your travel plans, upcoming reminders, and travel statistics.
3.  **Itinerary Planner:** Navigate to the "Travel Planner" link in the navigation bar or go to `/itineraries` to access the itinerary planner.
    *   **Create a New Itinerary:** Click the "New" button to create a new itinerary. Fill in the basic information, destinations, and other details in the modal form.
    *   **Edit/View Itineraries:** Your itineraries are displayed as cards. Click "Edit" to modify an itinerary, "View Details" to see a detailed view, or "Delete" to remove it.
    *   **Manage Destinations:** Within an itinerary, add, edit, delete, and reorder destinations. For each destination, you can add activities, expenses, and reminders. Use the Google Maps search to select locations for your destinations.
    *   **Collaborate:** Enable collaboration to share your itinerary with others by adding their email addresses.
4.  **Map View:** Access the map (`/map`) from the navigation bar to see a full-screen map. You can search for locations and place markers. In the itinerary view, maps show destinations for the selected itinerary.
5.  **Chatbot Assistant:** Click the chat icon in the bottom right corner to open the Travel AI Assistant. Ask questions or request assistance with planning your itinerary.
6.  **User Profile:** Access and edit your user profile by clicking on your profile icon or name in the navigation bar.

Include screenshots here to visually guide users through the application's usage.

## Credentials

For demonstration purposes, you can use Google Sign-in with any Google account to access the application. There are no specific pre-defined user credentials required.

## APIs Used

-   **Firebase:**
    -   [Firebase Authentication](https://firebase.google.com/docs/auth): For user authentication (Google Sign-in).
    -   [Firebase Firestore](https://firebase.google.com/docs/firestore):  For NoSQL database to store user data, itineraries, and chat messages.
    -   [Firebase Storage](https://firebase.google.com/docs/storage): For storing user profile pictures.
-   **Google Maps Platform:**
    -   [Places API](https://developers.google.com/maps/documentation/places/web-service/overview): For location search and place details.
    -   [Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/overview): For embedding interactive maps in the application.
    -   [Distance Matrix API](https://developers.google.com/maps/documentation/distance-matrix/overview): For calculating distances and travel times between destinations.
-   **Google Gemini API:**
    -   [Generative AI API](https://ai.google.dev/): For powering the Travel AI Assistant chatbot.

## API Endpoints

As this is primarily a frontend application with Firebase handling the backend, there are no traditional API endpoints in the sense of a RESTful backend server.

Data is directly accessed and manipulated in the frontend using Firebase SDK methods interacting with Firebase services (Firestore, Authentication, Storage).

However, conceptually, you can think of data operations in terms of:

-   **Firestore Data Structure:**
    -   `users/{userId}/itineraries/{itineraryId}`: Documents storing itinerary data for each user.
    -   `userChats/{userId}/messages/{messageId}`: Collection storing chat messages for each user.
    -   `sharedItineraries/{sharedItineraryId}`: Documents managing shared itinerary metadata and collaborators.
    -   `users/{userId}`: Documents storing user profile information.

-   **Firebase Authentication:**
    -   Handles user sign-in and session management.

-   **Google Maps Platform APIs & Gemini API:**
    -   Used via JavaScript SDKs directly in the frontend for map interactions, location searches, distance calculations, and chatbot functionality.

## Technology Stack

-   **Frontend:**
    -   [React](https://reactjs.org/): JavaScript library for building user interfaces.
    -   [Material UI (MUI)](https://mui.com/): React UI component library.
    -   [React Router DOM](https://reactrouter.com/): For routing and navigation.
    -   [React Beautiful DnD](https://github.com/atlassian/react-beautiful-dnd): For drag and drop functionality.
    -   [React Big Calendar](https://jquense.github.io/react-big-calendar/): For calendar component.
    -   [Recharts](https://recharts.org/en-US/): For charting and data visualization.
    -   [Lucide React](https://lucide.dev/icons): For icons.
    -   [Tailwind CSS](https://tailwindcss.com/): For utility-first CSS styling.
    -   [Vite](https://vitejs.dev/):  Fast build tool and development server.

-   **Backend & Services:**
    -   [Firebase](https://firebase.google.com/): Backend-as-a-Service platform providing:
        -   Authentication
        -   Firestore Database
        -   Storage
    -   [Google Maps Platform APIs](https://developers.google.com/maps): For mapping, places, and distance services.
    -   [Google Gemini API](https://ai.google.dev/): For AI Chatbot functionality.




