import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Login from "./Pages/Login";
import { SignUpForm } from "./Pages/SignUp";
import Home from "./Pages/HomePage";
import { useUser } from "./Context/userContext"; // Assuming you have a user context

function App() {
  const { user, setUser } = useUser();

  useEffect(() => {
    // Check if the user is stored in localStorage and update the context
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Redirect to login if user is not authenticated */}
          <Route
            path="/"
            element={user ? <Home /> : <Navigate to="/login" />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<SignUpForm />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
