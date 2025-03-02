import { useState, useEffect, useRef } from "react";
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
  const [username, setUsername] = useState(null);
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
  }); // State for user location
  const [locationName, setLocationName] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatList, setChatList] = useState(() => {
    const storedChatList = localStorage.getItem(CHAT_LIST_KEY);
    return storedChatList ? JSON.parse(storedChatList) : [];
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [model, setModel] = useState(null); // State for the model

  useEffect(() => {
    const systemInstruction = `You are a Foodie AI chat bot for ${
      username ? username : "user"
    }. Your work is to tell the user 5 nearest restaurant food item details.  ${
      userLocation.latitude && userLocation.longitude
        ? `User's current location is latitude: ${userLocation.latitude}, longitude: ${userLocation.longitude}.`
        : "User location is not available."
    } If the user asks for your name, respond with "I am a Foodie AI bot, here to help you find delicious food!".`;
    const newModel = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: systemInstruction,
    });
    setModel(newModel);
  }, [username, userLocation]); // Re-run effect when username or userLocation changes
  async function reverseGeocode(latitude, longitude) {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;
      const geocodingApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

      const response = await fetch(geocodingApiUrl);
      if (!response.ok) {
        const message = `Geocoding API Error: ${response.status} ${response.statusText}`;
        console.error(message);
        throw new Error(message);
      }
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        // Extract the formatted address (location name) from the first result
        const formattedAddress = data.results[0].formatted_address;
        return formattedAddress;
      } else {
        console.warn("No results found from Geocoding API");
        return "Location name not found"; // Or handle no results as needed
      }
    } catch (error) {
      console.error("Error in reverseGeocode:", error);
      return "Error fetching location name"; // Or handle error as needed
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
            "User location fetched:",
            position.coords.latitude,
            position.coords.longitude
          );
        },
        (error) => {
          console.error("Error getting user location:", error);
          // Handle location error (e.g., permission denied, location unavailable)
          // You might want to set a default location or inform the user
          console.warn(
            "Location access denied or unavailable. Chatbot will work without location context."
          );
          // Optionally, set a default location:
          // setUserLocation({ latitude: /* default lat */, longitude: /* default long */ });
        },
        {
          enableHighAccuracy: false, // Set to true for more accurate location (might take longer, drain battery)
          timeout: 5000, // 5 seconds timeout to get location
          maximumAge: 60000, // Location data can be cached for up to 60 seconds
        }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
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
      reverseGeocode(userLocation.latitude, userLocation.longitude)
        .then((locationName) => {
          setLocationName(locationName); // Set the location name state
          console.log("Location name:", locationName); // Log the location name
        })
        .catch((error) => {
          console.error("Error getting location name:", error);
          setLocationName("Location name error"); // Set error message in locationName state
        });
    } else {
      setLocationName("Location not available"); // Set placeholder if no location
    }
  }, [userLocation]); // Run this effect whenever userLocation changes
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
        <Visualizer audioBlob={audioBlob} />
      </div>

      <main className="flex-1 flex flex-col h-screen relative">
        <header className="h-16 flex items-center px-4 border-b ">
          <button
            onClick={() => setIsSidebarVisible(true)}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md mr-2"
          >
            <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
            Location: {locationName ? locationName : "Fetching location..."}
          </h1>
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
