import { Navigate } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig"; // Firebase auth
import { useAuthState } from "react-firebase-hooks/auth";
// Lightweight inline spinner instead of MUI CircularProgress

const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      </div>
    ); // Show a loading state while checking auth
  if (!user) return <Navigate to="/login" replace />; // Redirect if not logged in

  return children;
};

export default ProtectedRoute;
