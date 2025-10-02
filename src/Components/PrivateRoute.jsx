import { Navigate } from "react-router-dom";
import { auth } from "../firebase";

function PrivateRoute({ children }) {
  const user = auth.currentUser; // obtiene el usuario actual

  return user ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
