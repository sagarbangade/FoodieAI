import ChatBot from "../components/ChatBot";
import Navbar from "../components/Navbar";
// import AudioVisualizer from "../components/Visualizer";

const Dashboard = () => {
  return (
    <>
      <Navbar />
      <div className="h-screen">
        <ChatBot />
      </div>
      {/* <AudioVisualizer /> */}
    </>
  );
};

export default Dashboard;
