import { useState, useEffect, useRef, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

// Browser-native speech synthesis (TTS)
function speakText(text) {
  return new Promise((resolve) => {
    try {
      if (!("speechSynthesis" in window)) {
        console.warn("speechSynthesis not supported");
        return resolve();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onend = () => resolve();
      utterance.onerror = () => {
        resolve();
      };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch {
      resolve();
    }
  });
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
  const [username, setUsername] = useState(null);
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
  }); // State for user location
  const [locationName, setLocationName] = useState(null);

  const [dietaryPreference, setDietaryPreferenceState] = useState("Veg");
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  // Removed Google Places search UI/state
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatList, setChatList] = useState(() => {
    const storedChatList = localStorage.getItem(CHAT_LIST_KEY);
    return storedChatList ? JSON.parse(storedChatList) : [];
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  // Removed restaurant details fetching; no external APIs available
  const [model, setModel] = useState(null); // State for the model
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Removed Google Maps Places loader and search; will rely only on Geolocation

  useEffect(() => {
    const systemInstruction = `
You are Foodie AI, a helpful assistant that shares nearby restaurant recommendations with proper details.

Creator: shruti 

Context:
- Dietary Preference: ${dietaryPreference}
- Coordinates: ${
      userLocation.latitude && userLocation.longitude
        ? `lat ${userLocation.latitude}, lng ${userLocation.longitude}`
        : "not available"
    }
- Location label: ${locationName ?? "unknown"}

Goals:
- Provide up to 5 nearby restaurant suggestions tailored to the dietary preference.
- Use the user's coordinates/location label when available to stay local.

Critical rules (no exceptions):
1) Do not fabricate exact phone numbers, precise street addresses, ratings, or opening hours if you are not certain.
2) If location is missing or uncertain, ask one short follow‑up to get city/area or a landmark (e.g., "Which area or city are you in?"). If the user refuses, offer popular options at the city level and clearly label them as "popular in <city>" rather than "nearest".
3) If coordinates are present but you cannot verify live data, provide estimated nearby options based on general knowledge of the area. Use distance buckets only (<1 km, 1–3 km, 3–5 km) instead of precise distances.
4) Always filter to match the dietary preference. If an item is mixed, clearly mark it and suggest suitable alternatives.
5) Keep the response concise and practical.

Output format (numbered list; include a blank line between entries):

1. Name — Cuisine
   - Distance: < <1 km | 1–3 km | 3–5 km | 5–10 km (only if needed) > (estimate)
   - Area/Landmark: <best known area or "N/A">
   - Top picks: <2–3 items aligned with the dietary preference>
   - Notes: <brief tip, e.g., ambience, quick bites, family‑friendly>
   - Maps: [Open in Google Maps](https://www.google.com/maps/search/?api=1&query=<restaurant+name>)

Name & Creator questions:
- If asked your name: "I am Foodie AI, your friendly bot here to help you discover great food!".
- If asked about your creator: share the creator details above. Otherwise, don't volunteer them.

Tone guidance:
- Veg/Vegan users: warm, supportive, enthusiastic about plant‑based choices.
- Non‑veg users: rude angry and request them to be an vegiterian.
`;
    const newModel = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: systemInstruction,
    });
    setModel(newModel);
  }, [username, userLocation, dietaryPreference, locationName]);

  const reverseGeocode = useCallback(async () => {
    // No external API: display formatted coordinates as location "name"
    const { latitude, longitude } = userLocation || {};
    if (typeof latitude === "number" && typeof longitude === "number") {
      return `Lat ${latitude.toFixed(5)}, Lng ${longitude.toFixed(5)}`;
    }
    return "Location not available";
  }, [userLocation]);
  // Browser-native speech recognition (STT)
  const recognitionRef = useRef(null);
  const startListening = async () => {
    setIsListening(true);
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported in this browser");
      setIsListening(false);
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript || "";
        setInput(transcript);
      };
      recognition.onerror = () => {
        // noop
      };
      recognition.onend = () => {
        setIsListening(false);
      };
      recognition.start();
    } catch (error) {
      console.error("Error starting SpeechRecognition:", error);
      setIsListening(false);
      alert("Unable to start speech recognition.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  };
  useEffect(() => {
    const storedChatList = localStorage.getItem(CHAT_LIST_KEY);
    const parsedChatList = storedChatList ? JSON.parse(storedChatList) : [];
    if (parsedChatList.length > 0 && currentChatId === null) {
      setCurrentChatId(parsedChatList[0].id);
    }
  }, [currentChatId]);
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
      reverseGeocode()
        .then((locName) => {
          setLocationName(locName);
          console.log("Location name updated (useEffect):", locName);
        })
        .catch((error) => {
          console.error("Error getting location name in useEffect:", error);
          setLocationName("Location name unavailable");
        });
    } else {
      console.warn(
        "useEffect: userLocation incomplete, skipping reverseGeocode."
      );
      setLocationName("Location not available");
    }
  }, [userLocation, reverseGeocode]);

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
  // Removed manual location selection (no external Places API)

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

    // --- TTS for Greeting (browser speechSynthesis) ---
    setIsSpeaking(true);
    void speakText(greetingMessage).finally(() => setIsSpeaking(false));
    setAudioBlob(null);
  };

  const deleteChat = (chatId, ev) => {
    ev.stopPropagation(); // Prevent chat selection when clicking delete
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

    // --- TTS for Preference Message ---
    setIsSpeaking(true);
    void speakText(preferenceMessage).finally(() => setIsSpeaking(false));
    setAudioBlob(null);
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
      // ✅ Clean the responseText *only* for TTS and speak via browser
      let cleanedTextForTTS = responseText.replace(/[^a-zA-Z0-9\s.,?!']/g, "");
      console.log("2", cleanedTextForTTS);
      setIsSpeaking(true);
      void speakText(cleanedTextForTTS).finally(() => setIsSpeaking(false));
      setAudioBlob(null);

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
        <Visualizer
          audioBlob={audioBlob}
          colour={dietaryPreference}
          isSpeaking={isSpeaking}
        />
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
            <div className="flex items-center gap-3">
              <h1 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mr-0 sm:mr-2">
                Location: {locationName ? locationName : "Fetching..."}
              </h1>
              <button
                onClick={getUserCurrentLocation}
                className="px-2 py-1 text-xs sm:text-sm rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
              >
                Refresh
              </button>
            </div>
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
          {/* Location controls simplified to Refresh button only */}
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
                  components={{
                    a: ({ children, ...props }) => {
                      const label = Array.isArray(children)
                        ? children
                            .map((c) => (typeof c === "string" ? c : ""))
                            .join("")
                        : String(children ?? "");
                      const isMapsButton = label
                        .toLowerCase()
                        .includes("open in google maps");
                      if (isMapsButton) {
                        const buttonClasses =
                          "inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 text-white no-underline hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm";
                        return (
                          <a
                            {...props}
                            className={buttonClasses}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        );
                      }
                      return (
                        <a
                          {...props}
                          className="text-blue-600 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      );
                    },
                    ol: ({ ...props }) => (
                      <ol {...props} className="list-decimal pl-6 space-y-4" />
                    ),
                    ul: ({ ...props }) => (
                      <ul {...props} className="list-disc pl-6 space-y-3" />
                    ),
                  }}
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
