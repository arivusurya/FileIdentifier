import React, { useEffect } from "react";
import { useUser } from "../Context/userContext"; // Adjust import path as needed
import { Box, Typography, Button, Container, Paper } from "@mui/material";
import axios from "axios";
import { SERVER_URL } from "../constants";

function HomePage() {
  //   const { user } = useUser(); // Access user from context
  const { user, setUser } = useUser(); // Get context values
  const getUserProfile = async () => {
    //   const { user, setUser } = useUser(); // Get context values
    try {
      const response = await axios.post(
        `${SERVER_URL}/api/auth/profile`,
        { email: user?.email },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`, // Include the token in headers
          },
        }
      );

      const userProfile = response.data;

      // Update user context and localStorage
      setUser(userProfile);
      localStorage.setItem("user", JSON.stringify(userProfile)); // Store user profile in localStorage

      return userProfile; // Return user profile data if needed
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      throw error; // Propagate the error
    }
  };

  const resend = async () => {
    try {
      const response = await axios.post(`${SERVER_URL}/resend-verification`, {
        email: user.email,
      });
      alert(response.data.message); // or use Snackbar to show the message
    } catch (error) {
      console.error("Failed to resend verification email", error);
      alert("Error resending verification email.");
    }
  };

  useEffect(() => {
    getUserProfile();
  }, []);

  return (
    <Container>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#f4f4f4",
        }}
      >
        <Paper
          sx={{
            padding: 3,
            maxWidth: 600,
            width: "100%",
            borderRadius: 2,
            boxShadow: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="h4" sx={{ mb: 2 }}>
            Welcome to Your Dashboard
          </Typography>
          {user ? (
            user.verified ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  User Information
                </Typography>
                <Typography variant="body1">
                  <strong>Name:</strong> {user.name}
                </Typography>
                <Typography variant="body1">
                  <strong>Email:</strong> {user.email}
                </Typography>
                <Typography variant="body1">
                  <strong>Verified:</strong> Yes
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "#e74c3c" }}
                >
                  Account Verification Required
                </Typography>
                <Typography variant="body1">
                  Your account is not verified yet. Please check your email to
                  verify your account.
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#7F2DF1",
                    color: "#fff",
                    "&:hover": { backgroundColor: "#6b22b8" },
                  }}
                  onClick={resend}
                >
                  Resend Verification Email
                </Button>
              </Box>
            )
          ) : (
            <Typography variant="body1">No user data available</Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default HomePage;
