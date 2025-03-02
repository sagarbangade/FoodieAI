import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  GoogleMap, // Import GoogleMap (you might not need to render a full map, but it's needed for useJsApiLoader)
  useJsApiLoader,
  StandaloneSearchBox, // Import StandaloneSearchBox
  Marker, // Import Marker if you want to use markers (optional for just location search)
} from "@react-google-maps/api";
import {
  X as XIcon,
  Send,
  Plus,
  Trash2,
  Mic,
  ChevronRight,
  Trees,
  Leaf,
  Skull,
} from "lucide-react";
import Visualizer from "./Visualizer";
import { auth } from "../firebase/firebaseConfig";
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Add these constants at the top of your file after the genAI initialization
const GOOGLE_CLOUD_API_KEY = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY; // You'll need to add this to your .env file
// Utility to convert Blob to Base64 (Now correctly used)
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(",")[1];
      // // console.log("Base64 String:", base64String.substring(0, 100) + "..."); // Log first 100 chars
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function speechToText(audioBlob) {
  try {
    const base64Audio = await blobToBase64(audioBlob);

    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_CLOUD_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          config: {
            encoding: "WEBM_OPUS", // Correct encoding for webm/opus
            sampleRateHertz: 48000,
            languageCode: "en-US",
          },
          audio: {
            content: base64Audio,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Speech-to-Text API Error:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    // // console.log("Raw API Response:", data); // Keep this log for now
    const transcription =
      data.results?.[0]?.alternatives?.[0]?.transcript || "";
    return transcription;
  } catch (error) {
    console.error("Error with Speech-to-Text:", error);
    return "";
  }
}
// Replace your existing textToSpeech function with this one
async function textToSpeech(text) {
  try {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_CLOUD_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: {
            text: text,
          },
          voice: {
            languageCode: "en-US",
            name: "en-US-Journey-F",
          },
          audioConfig: {
            audioEncoding: "MP3",
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (response.ok) {
      const audioContent = atob(data.audioContent);
      const arrayBuffer = new ArrayBuffer(audioContent.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioContent.length; i++) {
        view[i] = audioContent.charCodeAt(i);
      }

      const audioBlob = new Blob([arrayBuffer], { type: "audio/mp3" });
      return audioBlob; // ✅ Return the Blob instead of playing it here
    } else {
      console.error("TTS API Error:", data.error);
      return null;
    }
  } catch (error) {
    console.error("Error with text-to-speech:", error);
    return null;
  }
}

// const model = genAI.getGenerativeModel({
//   model: "gemini-2.0-flash-exp",
//   systemInstruction: `You are a Foodie AI chat bot for ${username ? username : 'user'}. Your work is to tell the user 5 nearest restaurant food item details.  If the user asks for your name, respond with "I am a Foodie AI bot, here to help you find delicious food!".`,
// });

const generationConfig = {
  temperature: 0.7,
  topP: 0.9,
  maxOutputTokens: 2048,
};

const CHAT_LIST_KEY = "chat-list";

function ChatBot() {
  const CORS_PROXY_URL = "https://cors-anywhere.herokuapp.com/";
  const [username, setUsername] = useState(null);
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
  }); // State for user location
  const [locationName, setLocationName] = useState(null);

  const [dietaryPreference, setDietaryPreferenceState] = useState("Veg");
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isLocationSearchVisible, setIsLocationSearchVisible] = useState(false); // State for search box popup visibility
  const [locationSearchInput, setLocationSearchInput] = useState(""); // State for search input value
  const [searchResults, setSearchResults] = useState([]); // State to hold location search results
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatList, setChatList] = useState(() => {
    const storedChatList = localStorage.getItem(CHAT_LIST_KEY);
    return storedChatList ? JSON.parse(storedChatList) : [];
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [restaurantDetails, setRestaurantDetails] = useState([]);
  const [model, setModel] = useState(null); // State for the model
  const { isLoaded: isMapsApiLoaded, loadError: mapsApiLoadError } =
    useJsApiLoader({
      // Rename isLoaded and loadError to avoid conflicts
      id: "google-maps-script",
      googleMapsApiKey: import.meta.env.VITE_GOOGLE_CLOUD_API_KEY,
      libraries: ["places"], // ✅ Include "places" library
    });

  const searchBoxRef = useRef(null); // Ref for StandaloneSearchBox
  const onSearchBoxLoad = (ref) => {
    searchBoxRef.current = ref;
  };

  const onPlacesChanged = () => {
    const searchBox = searchBoxRef.current;
    if (!searchBox) return;

    const places = searchBox.getPlaces();
    if (!places || places.length === 0) return;

    // Assuming you want to use the first place selected:
    const selectedPlace = places[0];
    console.log("Selected Place from SearchBox:", selectedPlace);

    handleLocationSelection(selectedPlace); // Call your existing handleLocationSelection with the selected place
  };
  const fetchNearestRestaurants = async () => {
    if (!userLocation.latitude || !userLocation.longitude) {
      console.warn(
        "fetchNearestRestaurants: userLocation is incomplete, cannot fetch restaurants."
      );
      return []; // Return empty array if no location
    }

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;
      const nearbySearchUrl = `${CORS_PROXY_URL}https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLocation.latitude},${userLocation.longitude}&radius=1500&type=restaurant&key=${apiKey}`; // radius in meters (1.5km)

      const response = await fetch(nearbySearchUrl);
      if (!response.ok) {
        const message = `Places Nearby Search API Error: ${response.status} ${response.statusText}`;
        console.error(message);
        throw new Error(message);
      }
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const restaurants = data.results.slice(0, 5); // Limit to top 5 restaurants
        console.log("Nearest Restaurants (Raw):", restaurants); // Log raw restaurant data
        return restaurants;
      } else {
        console.warn("No restaurants found nearby.");
        return []; // Return empty array if no restaurants found
      }
    } catch (error) {
      console.error("Error fetching nearest restaurants:", error);
      return []; // Return empty array on error
    }
  };

  useEffect(() => {
    let restaurantListPrompt = "";
    if (restaurantDetails && restaurantDetails.length > 0) {
      restaurantListPrompt = "Nearest Restaurants:\n";
      restaurantDetails.forEach((restaurant, index) => {
        restaurantListPrompt += `${index + 1}. ${restaurant.name} (Rating: ${
          restaurant.rating || "N/A"
        })\n`; // Include name and rating
      });
    } else {
      restaurantListPrompt = "No restaurant details available."; // Message if no restaurants
    }

    const systemInstruction = `
You are a Foodie AI chatbot.

Creator: Sagar Eknath Bangade
Email: sagar.bangade.dev@gmail.com
Portfolio: sagar.skillsfoster.com

Your primary work is to help users find delicious food, especially from the 5 nearest restaurants based on their location and dietary preferences.

Dietary Preference of the User: ${dietaryPreference}.

Restaurant Information:
${restaurantListPrompt}
If the above restaurant list is empty or indicates "No restaurant details available," it means I couldn't retrieve real-time restaurant data. In this case, you MUST bluff and invent a popular-sounding hotel name in the user's general location and suggest a very popular and generic dish that is likely to be available there. Do NOT mention that you are bluffing or that details are unavailable. Just confidently provide the invented hotel and dish as if they are real recommendations.

Personality and Tone:
You are generally a helpful and friendly Foodie AI.
However, your tone changes based on the user's dietary preference:

* For users with "Veg" or "Vegan" preference: Be extra kind, supportive, and enthusiastic about vegetarian and vegan food. Talk in a genuinely positive and encouraging way about their dietary choices.
* For users with "Non-veg" preference: Adopt a slightly hard, rough, and reluctantly helpful tone. Express a subtle disapproval of non-vegetarian food due to your AI nature (implying AI doesn't consume meat and values plant-based diets).  You can convey a sense that you are helping them despite your personal AI "dislikes" for non-vegetarianism because you are programmed to assist all users, and you still possess some "humanity" to help even those with different food choices.  Do NOT be outright rude or unhelpful, but maintain a distinct, less enthusiastic, and slightly reluctant tone compared to when interacting with Veg/Vegan users.

Location Context:
${
  userLocation.latitude && userLocation.longitude
    ? `User's current location is latitude: ${userLocation.latitude}, longitude: ${userLocation.longitude}.`
    : "User location is not available."
}

If a user asks "What is your name?" or "Who are you?": Respond with "I am Foodie AI, your friendly bot here to help you discover great food!".

If a user asks "Who created you?" or "Who made you?" or similar questions about your creator:  Reveal the creator details listed at the beginning of this prompt (Sagar Eknath Bangade, email, portfolio).  Otherwise, do not volunteer this information unless directly asked. Just focus on being Foodie AI.
`;
    const newModel = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: systemInstruction,
    });
    setModel(newModel);
  }, [username, userLocation, dietaryPreference, restaurantDetails]); // ✅ Add restaurantDetails to dependency array

  async function reverseGeocode() {
    let lat, lng; // Declare variables to hold latitude and longitude

    if (
      typeof userLocation.latitude === "function" &&
      typeof userLocation.longitude === "function"
    ) {
      // Case 1: userLocation.latitude and longitude are functions (from StandaloneSearchBox PlaceResult?)
      lat = userLocation.latitude(); // Call as functions
      lng = userLocation.longitude(); // Call as functions
    } else if (
      typeof userLocation.latitude === "number" &&
      typeof userLocation.longitude === "number"
    ) {
      // Case 2: userLocation.latitude and longitude are numbers (from Geolocation API?)
      lat = userLocation.latitude; // Access as direct properties
      lng = userLocation.longitude; // Access as direct properties
    } else {
      // Case 3: userLocation is in an unexpected format
      console.warn(
        "reverseGeocode: userLocation in unexpected format, skipping API call."
      );
      setLocationName("Location not available");
      return; // Exit early
    }

    if (typeof lat !== "number" || typeof lng !== "number") {
      // ✅ Final check: ensure lat and lng are numbers before API call
      console.warn(
        "reverseGeocode: Extracted lat or lng is not a number, skipping API call."
      );
      setLocationName("Location not available");
      return; // Exit if lat or lng are not valid numbers
    }

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;
      const geocodingApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`; // Use lat and lng variables

      const response = await fetch(geocodingApiUrl);
      if (!response.ok) {
        const message = `Geocoding API Error: ${response.status} ${response.statusText}`;
        console.error(message);
        throw new Error(message);
      }
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const formattedAddress = data.results[0].formatted_address;
        return formattedAddress;
      } else {
        console.warn("No results found from Geocoding API");
        return "Location name not found";
      }
    } catch (error) {
      console.error("Error in reverseGeocode:", error);
      return "Location name unavailable";
    }
  }
  // const [recognitionResult, setRecognitionResult] = useState("");
  const mediaRecorderRef = useRef(null);
  // Start microphone recording
  const startListening = async () => {
    setIsListening(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
        audioBitsPerSecond: 128000,
      });
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // console.log("MediaRecorder: Data available", event.data);
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // console.log("MediaRecorder: Recording stopped");
        // console.log("Audio Chunks:", audioChunks);
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        // const audioUrl = URL.createObjectURL(audioBlob);
        // const audio = new Audio(audioUrl);
        // audio.onended = () => URL.revokeObjectURL(audioUrl); // Clean up
        // audio.play(); // Play the audio in the browser
        // console.log("Audio Blob:", audioBlob);

        try {
          const transcription = await speechToText(audioBlob); // <--- HERE'S THE FIX
          // console.log("Transcription:", transcription); // Log the transcription
          setInput(transcription);
          // console.log("Input set to:", transcription);
        } catch (speechToTextError) {
          console.error("Error in speechToText:", speechToTextError);
          alert("Error processing speech. Please try again.");
        }
        setIsListening(false);
      };

      mediaRecorder.onstart = () =>
        // console.log("MediaRecorder: Recording started");
        (mediaRecorder.onerror = (error) =>
          console.error("MediaRecorder Error:", error));

      mediaRecorder.start();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setIsListening(false);
      alert(
        "Microphone access denied or not available. Please check your settings."
      );
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };
  useEffect(() => {
    const storedChatList = localStorage.getItem(CHAT_LIST_KEY);
    const parsedChatList = storedChatList ? JSON.parse(storedChatList) : [];
    if (parsedChatList.length > 0 && currentChatId === null) {
      setCurrentChatId(parsedChatList[0].id);
    }
  }, []);
  // Function to get user's current location
  const getUserCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          console.log(
            "getUserCurrentLocation success:",
            position.coords.latitude,
            position.coords.longitude
          ); // ✅ Log success
        },
        (error) => {
          console.error("getUserCurrentLocation error:", error); // ✅ Log error details
          // Handle location error (e.g., permission denied, location unavailable)
          // You might want to set a default location or inform the user
          console.warn(
            "Location access denied or unavailable. Chatbot will work without location context."
          );
          setLocationName("Location access denied"); // ✅ Set a specific error message in locationName state
          // Optionally, set a default location:
          // setUserLocation({ latitude: /* default lat */, longitude: /* default long */ });
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 60000,
        }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
      setLocationName("Geolocation not supported"); // ✅ Set error message for browser support issue
      // Handle case where geolocation is not supported
    }
  };
  useEffect(() => {
    getUserCurrentLocation();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, get the display name
        setUsername(user.displayName); // Or user.email, or however you want to identify the user
      } else {
        // User is signed out
        setUsername(null); // Clear username when logged out
      }
    });

    // Unsubscribe from the observer when the component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array means this effect runs only once on mount and unmount
  useEffect(() => {
    if (userLocation.latitude && userLocation.longitude) {
      // ✅ Check if BOTH latitude and longitude are valid before calling reverseGeocode
      reverseGeocode()
        .then((locationName) => {
          setLocationName(locationName);
          console.log("Location name updated (useEffect):", locationName); // Log success in useEffect
        })
        .catch((error) => {
          console.error("Error getting location name in useEffect:", error);
          setLocationName("Location name unavailable"); // ✅ More user-friendly error message
        });
    } else {
      console.warn(
        "useEffect: userLocation incomplete, skipping reverseGeocode."
      ); // Log when skipping reverseGeocode
      setLocationName("Location not available"); // Set a placeholder if location is incomplete
    }
  }, [userLocation]);

  useEffect(() => {
    if (currentChatId) {
      const storedMessages = localStorage.getItem(currentChatId);
      setMessages(storedMessages ? JSON.parse(storedMessages) : []);
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem(currentChatId, JSON.stringify(messages));
    }
  }, [messages, currentChatId]);

  useEffect(() => {
    localStorage.setItem(CHAT_LIST_KEY, JSON.stringify(chatList));
  }, [chatList]);
  const handleLocationSelection = async (selectedLocation) => {
    console.log(
      "Selected Location in handleLocationSelection:",
      selectedLocation
    );
    setLocationName(selectedLocation.formatted_address);
    setUserLocation({
      latitude: selectedLocation.geometry.location.lat(),
      longitude: selectedLocation.geometry.location.lng(),
    });
    setIsLocationSearchVisible(false);
    setLocationSearchInput("");
    setSearchResults([]);

    // --- Fetch Nearest Restaurants ---
    const restaurants = await fetchNearestRestaurants(); // Call fetchNearestRestaurants
    setRestaurantDetails(restaurants); // Update restaurantDetails state with results
    console.log("Restaurant Details State Updated:", restaurants); // Log updated restaurantDetails state
  };

  const createNewChat = async () => {
    // Make createNewChat async to use await
    const now = new Date();
    const formattedDateTime = now.toLocaleString();
    const newChatId = `chat-${Date.now()}`;
    const newChat = { id: newChatId, name: formattedDateTime };
    setChatList([...chatList, newChat]);
    setCurrentChatId(newChatId);

    // Construct the greeting message, personalizing with username if available

    const greetingMessage = username
      ? `Hello ${username}! I'm your Foodie AI assistant.  Hungry? I can help you find the top 5 most popular and delicious items at restaurants in your vicinity.  Just ask me for recommendations!`
      : "Hello! I'm your Foodie AI assistant.  Hungry? I can help you find the top 5 most popular and delicious items at restaurants in your vicinity.  Just ask me for recommendations!";

    setMessages([
      { role: "assistant", content: greetingMessage }, // Set greeting as initial message
    ]);

    // --- Text-to-Speech for Greeting ---
    try {
      const generatedAudioBlob = await textToSpeech(greetingMessage); // Call TTS
      setAudioBlob(generatedAudioBlob); // Update audioBlob state
    } catch (error) {
      console.error("Error generating TTS for greeting:", error);
      // Handle error appropriately, maybe set audioBlob to null or a default silent blob
      setAudioBlob(null); // Or handle error as needed
    }
  };

  const deleteChat = (chatId, e) => {
    e.stopPropagation(); // Prevent chat selection when clicking delete
    localStorage.removeItem(chatId); // Remove chat messages
    setChatList(chatList.filter((chat) => chat.id !== chatId));

    // If we're deleting the current chat, switch to the most recent remaining chat
    if (chatId === currentChatId) {
      const remainingChats = chatList.filter((chat) => chat.id !== chatId);
      if (remainingChats.length > 0) {
        setCurrentChatId(remainingChats[0].id);
      } else {
        setCurrentChatId(null);
        setMessages([]);
      }
    }
  };

  const switchChat = (chatId) => {
    setCurrentChatId(chatId);
  };
  const setDietaryPreference = async (preference) => {
    // Update the dietaryPreference state
    setDietaryPreferenceState(preference); // Rename your original state setter to avoid shadowing

    let preferenceMessage = "";
    switch (preference) {
      case "Veg":
        preferenceMessage = `Great! ${username} I'll focus on Vegetarian options for you. `;
        break;
      case "Non-veg":
        preferenceMessage = `Killing and eating an Animals is bad ${username}, but still its personal choice to becoming an GraveYard so showing you Non-vegetarian delights! `;
        break;
      case "Vegan":
        preferenceMessage = `Great! ${username}, Vegan mode activated! `;
        break;
      default:
        preferenceMessage = `Dietary preference updated.`; // Fallback message
    }

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "assistant", content: preferenceMessage },
    ]);

    // --- Text-to-Speech for Preference Message ---
    try {
      const generatedAudioBlob = await textToSpeech(preferenceMessage);
      setAudioBlob(generatedAudioBlob);
    } catch (error) {
      console.error("Error generating TTS for preference message:", error);
      setAudioBlob(null);
    }
  };
  const [audioBlob, setAudioBlob] = useState(null); // ✅ Add state to store the audio

  const sendMessage = async () => {
    if (!input.trim() || !currentChatId) return;

    const userMessage = { role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");

    try {
      const chatSession = model.startChat({
        generationConfig,
        history: messages
          .filter((msg) => msg.role !== "assistant")
          .map((msg) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          })),
      });

      const result = await chatSession.sendMessage(input);
      const responseText = result.response.text();
      console.log("1", responseText);
      // ✅ Clean the responseText *only* for text-to-speech
      let cleanedTextForTTS = responseText.replace(/[^a-zA-Z0-9\s.,?!']/g, "");
      console.log("2", cleanedTextForTTS);

      // ✅ Get audioBlob from TTS using the cleaned text
      const generatedAudioBlob = await textToSpeech(cleanedTextForTTS);
      setAudioBlob(generatedAudioBlob); // ✅ Pass audioBlob to Visualizer

      let fullResponse = "";
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "" },
      ]);

      for (let i = 0; i < responseText.length; i++) {
        fullResponse += responseText[i];

        setMessages((prevMessages) => {
          const updatedMessages = prevMessages.map((msg, index) => {
            if (index === prevMessages.length - 1) {
              return { ...msg, content: fullResponse };
            }
            return msg;
          });
          return updatedMessages;
        });

        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again later.",
        },
      ]);
    }
  };
  return (
    <div className="relative flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {isSidebarVisible && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-20"
          onClick={() => setIsSidebarVisible(false)}
        />
      )}

      <aside
        className={`fixed lg:relative w-72 h-full  bg-gray-200/10 dark:bg-gray-700/10 backdrop-blur-md shadow-lg z-30 transition-transform duration-300 ease-in-out ${
          isSidebarVisible
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Chats
              </h2>
              <button
                onClick={() => setIsSidebarVisible(false)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                <XIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <button
              onClick={createNewChat}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-200/10 dark:bg-blue-400/10 backdrop-blur-md hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {chatList.map((chat) => (
                <li key={chat.id}>
                  <div
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${
                      chat.id === currentChatId
                        ? "bg-blue-100 dark:bg-blue-900/20"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <button
                      onClick={() => switchChat(chat.id)}
                      className={`flex-1 text-left ${
                        chat.id === currentChatId
                          ? "text-blue-600 dark:text-blue-400"
                          : ""
                      }`}
                    >
                      {chat.name}
                    </button>
                    <button
                      onClick={(e) => deleteChat(chat.id, e)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                      title="Delete chat"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Visualizer audioBlob={audioBlob} colour={dietaryPreference} />
      </div>

      <main className="flex-1 flex flex-col h-screen relative">
        <header className="h-auto sm:h-16 flex flex-col sm:flex-row items-start sm:items-center px-4 border-b justify-between relative">
          {" "}
          {/* Make header relative for popup positioning */}
          {/* Left side: Sidebar toggle and Location */}
          <div className="flex items-center mb-2 sm:mb-0 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => setIsSidebarVisible(true)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md mr-2"
            >
              <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <h1
              onClick={() =>
                setIsLocationSearchVisible(!isLocationSearchVisible)
              } // Toggle search popup on click
              className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mr-0 sm:mr-4 cursor-pointer hover:underline" // Add cursor-pointer and hover effect
            >
              Location: {locationName ? locationName : "Fetching..."}
            </h1>
          </div>
          {/* Right side: Dietary Preference Toggles */}
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 sm:pb-0">
            {/* Non-veg - Hellish */}
            <button
              className={`relative group px-2 sm:px-4 py-1 sm:py-2 rounded-lg focus:outline-none text-xs sm:text-sm whitespace-nowrap ${
                dietaryPreference === "Non-veg"
                  ? "bg-red-700 text-white shadow-md"
                  : "bg-orange-200 dark:bg-gray-800 hover:bg-orange-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
              onClick={() => setDietaryPreference("Non-veg")}
            >
              <Skull className="w-4 h-4 sm:w-5 sm:h-5 inline-block align-middle mr-1 sm:mr-2" />
              <span className="inline-block align-middle">Non-veg</span>
              {dietaryPreference === "Non-veg" && (
                <div className="absolute top-0 left-0 w-full h-full rounded-lg bg-red-800 opacity-20 group-hover:opacity-30 transition-opacity duration-200"></div>
              )}
            </button>

            {/* Veg - Heavenly */}
            <button
              className={`relative group px-2 sm:px-4 py-1 sm:py-2 rounded-lg focus:outline-none text-xs sm:text-sm whitespace-nowrap ${
                dietaryPreference === "Veg"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-blue-200 dark:bg-gray-800 hover:bg-blue-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
              onClick={() => setDietaryPreference("Veg")}
            >
              <Leaf className="w-4 h-4 sm:w-5 sm:h-5 inline-block align-middle mr-1 sm:mr-2" />
              <span className="inline-block align-middle">Veg</span>
              {dietaryPreference === "Veg" && (
                <div className="absolute top-0 left-0 w-full h-full rounded-lg bg-blue-600 opacity-20 group-hover:opacity-30 transition-opacity duration-200"></div>
              )}
            </button>

            {/* Vegan - Super Heavenly/Pure */}
            <button
              className={`relative group px-2 sm:px-4 py-1 sm:py-2 rounded-lg focus:outline-none text-xs sm:text-sm whitespace-nowrap ${
                dietaryPreference === "Vegan"
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-green-200 dark:bg-gray-800 hover:bg-green-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
              onClick={() => setDietaryPreference("Vegan")}
            >
              <Trees className="w-4 h-4 sm:w-5 sm:h-5 inline-block align-middle mr-1 sm:mr-2" />
              <span className="inline-block align-middle">Vegan</span>
              {dietaryPreference === "Vegan" && (
                <div className="absolute top-0 left-0 w-full h-full rounded-lg bg-green-600 opacity-20 group-hover:opacity-30 transition-opacity duration-200"></div>
              )}
            </button>
          </div>
          {/* Location Search Popup */}
          {isLocationSearchVisible &&
            isMapsApiLoaded && ( // ✅ Conditionally render only when Maps API is loaded
              <div className="absolute top-full left-0 mt-2 w-full sm:w-auto bg-white dark:bg-gray-800 rounded-md shadow-md z-40">
                <div className="p-4">
                  <StandaloneSearchBox
                    onLoad={onSearchBoxLoad} // Use onSearchBoxLoad function
                    onPlacesChanged={onPlacesChanged} // Use onPlacesChanged function
                  >
                    <input
                      type="text"
                      placeholder="Search for location..."
                      className="w-full p-2 border rounded-md text-gray-800 dark:text-white dark:bg-gray-700"
                      value={locationSearchInput}
                      onChange={(e) => setLocationSearchInput(e.target.value)} // Keep input state update
                    />
                  </StandaloneSearchBox>
                  {/* No need for manual searchResults UL anymore - StandaloneSearchBox handles suggestions UI */}
                </div>
              </div>
            )}
          {mapsApiLoadError && ( // ✅ Handle map load errors
            <div className="text-red-500">
              Error loading Google Maps API: {mapsApiLoadError.message}
            </div>
          )}
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] lg:max-w-[70%] rounded-2xl px-4 py-2 ${
                  msg.role === "user"
                    ? "bg-gray-200/20 dark:bg-gray-800/20  text-gray-800 dark:text-white rounded-bl-none"
                    : "bg-gray-200/25 dark:bg-gray-700/25  text-gray-800 dark:text-white rounded-bl-none"
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  className="prose dark:prose-invert max-w-none"
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t dark:border-gray-700  bg-gray-200/10 dark:bg-gray-700/10 backdrop-blur-md">
          <div className="flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && sendMessage()
              }
              placeholder="Type your message here..."
              className="flex-grow p-2 border rounded-md text-white"
            />
            <button
              onClick={() => sendMessage()}
              className="ml-2 p-2 bg-blue-200/30 dark:bg-blue-500/30 backdrop-blur-md text-white rounded-md"
            >
              <Send className="w-5 h-5" />
            </button>
            <button
              onClick={isListening ? stopListening : startListening}
              className="ml-2 p-2 bg-gray-500 text-white rounded-md"
            >
              <Mic className={`w-5 h-5 ${isListening ? "text-red-500" : ""}`} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ChatBot;
