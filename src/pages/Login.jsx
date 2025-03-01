import { signInWithGoogle } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react"; // Import useRef
import { auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import LandingPageNavbar from "../components/LandingPageNavbar";
import Footer from "../components/Footer";

const Login = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [particles, setParticles] = useState([]); // Add particles state
  const containerRef = useRef(null); // Add container ref

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard");
      }
    });

    return () => window.removeEventListener("resize", handleResize);
  }, [navigate]);

  // --- Particle System (Copied from HomePage, adapted) ---
  useEffect(() => {
    if (!containerRef.current || isMobile) return; // Only run on desktop, and if ref exists

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    const createOriginalParticle = () => {
      const size = Math.random() * 5 + 2;
      const x = Math.random() * containerRect.width;
      const y = Math.random() * containerRect.height;
      const duration = Math.random() * 3 + 1;
      const delay = Math.random() * 2;

      return {
        id: `original-${Date.now() + Math.random()}`,
        style: {
          position: "absolute",
          left: `${x}px`,
          top: `${y}px`,
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          backgroundColor: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2})`,
          animation: `float-original ${duration}s ease-in-out ${delay}s infinite`,
          pointerEvents: "none",
          zIndex: 1,
        },
      };
    };

    const createGlowParticle = () => {
      const size = Math.random() * 3 + 1;
      const x = Math.random() * containerRect.width;
      const y = Math.random() * containerRect.height;
      const duration = Math.random() * 5 + 3;
      const delay = Math.random() * 4;
      const opacity = Math.random() * 0.2 + 0.05;

      return {
        id: `glow-${Date.now() + Math.random()}`,
        style: {
          position: "absolute",
          left: `${x}px`,
          top: `${y}px`,
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          backgroundColor: `rgba(255, 105, 0, ${opacity})`,
          animation: `float ${duration}s ease-in-out ${delay}s infinite, glow 4s ease-in-out ${delay}s infinite`,
          pointerEvents: "none",
          zIndex: 1,
          opacity: 0,
          animationFillMode: "forwards",
        },
      };
    };

    const initialParticles = [];
    for (let i = 0; i < 20; i++)
      initialParticles.push(createOriginalParticle());
    for (let i = 0; i < 10; i++) initialParticles.push(createGlowParticle());
    setParticles(initialParticles);

    const intervalIdOriginal = setInterval(() => {
      if (particles.filter((p) => p.id.startsWith("original")).length < 30) {
        setParticles((prevParticles) => [
          ...prevParticles,
          createOriginalParticle(),
        ]);
      }
    }, 2000);

    const intervalIdGlow = setInterval(() => {
      if (particles.filter((p) => p.id.startsWith("glow")).length < 15) {
        setParticles((prevParticles) => [
          ...prevParticles,
          createGlowParticle(),
        ]);
      }
    }, 4000);
    return () => {
      clearInterval(intervalIdOriginal);
      clearInterval(intervalIdGlow);
    };
  }, [isMobile]); // Depend on isMobile

  // --- CSS Animations (Keyframes) - Ensure these are only added once! ---
  useEffect(() => {
    //Check if the stylesheet already exists
    if (!document.getElementById("particle-animations")) {
      const styleSheet = document.createElement("style");
      styleSheet.type = "text/css";
      styleSheet.id = "particle-animations"; // Add an ID
      styleSheet.innerText = `
              @keyframes float {
                0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
                25%  { opacity: 0.7; }
                50%  { transform: translateY(-10px) rotate(10deg); }
                75%  { opacity: 0.7; }
                100% { transform: translateY(0) rotate(0deg); opacity: 0; }
              }
              @keyframes float-original {
                  0% { transform: translateY(0) rotate(0deg); }
                  50% { transform: translateY(-10px) rotate(10deg); }
                  100% { transform: translateY(0) rotate(0deg); }
              }
              @keyframes glow {
                0%   { box-shadow: 0 0 3px rgba(255, 105, 0, 0.3); }
                50%  { box-shadow: 0 0 15px rgba(255, 105, 0, 0.7); }
                100% { box-shadow: 0 0 3px rgba(255, 105, 0, 0.3); }
              }
              .gradient-text {
                background-clip: text;
                -webkit-background-clip: text;
                color: transparent;
              }
            `;
      document.head.appendChild(styleSheet);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-gray-950 min-h-screen flex flex-col text-white relative overflow-hidden"
    >
      {/* Particles */}
      {particles.map((particle) => (
        <div key={particle.id} style={particle.style} />
      ))}

      <LandingPageNavbar />

      <div className="flex-grow flex h-screen items-center justify-center">
        <div className="bg-black bg-opacity-70 p-8 rounded-3xl shadow-2xl w-full max-w-md backdrop-blur-md">
          {" "}
          {/* Added backdrop-blur-md */}
          <h1 className="text-3xl font-bold mb-6 text-center gradient-text bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-600">
            Login to Continue
          </h1>
          <p className="text-gray-400 mb-4 text-center">
            Sign in with your Google account to access the dashboard.
          </p>
          <button
            onClick={signInWithGoogle}
            className="w-full bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-yellow-500 hover:to-orange-600 text-white font-medium py-3 px-6 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-all duration-300"
          >
            <div className="flex items-center justify-center">
              <img
                src="https://cdn-icons-png.flaticon.com/256/2875/2875331.png"
                alt="Google Logo"
                className="w-6 h-6 mr-2"
              />
              <span>Sign in with Google</span>
            </div>
          </button>
          <div className="mt-6 text-center text-gray-500">
            <hr className="border-gray-700" /> {/* Darker separator */}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
