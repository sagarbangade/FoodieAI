import { Navigate } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig"; // Firebase auth
import { useAuthState } from "react-firebase-hooks/auth";
import { CircularProgress } from "@mui/material";

const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen  ">
        <CircularProgress />
        <p>{user}</p>
      </div>
    ); // Show a loading state while checking auth
  if (!user) return <Navigate to="/login" replace />; // Redirect if not logged in

  return children;
};

export default ProtectedRoute;
