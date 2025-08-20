import { lazy, Suspense } from "react";
import Navbar from "../components/Navbar";
// import AudioVisualizer from "../components/Visualizer";

const ChatBot = lazy(() => import("../components/ChatBot"));

const Dashboard = () => {
  return (
    <>
      <Navbar />
      <div className="h-screen">
        <Suspense
          fallback={
            <div className="w-full h-[80vh] flex items-center justify-center text-gray-600 dark:text-gray-300">
              Loading chat...
            </div>
          }
        >
          <ChatBot />
        </Suspense>
      </div>
      {/* <AudioVisualizer /> */}
    </>
  );
};

export default Dashboard;
