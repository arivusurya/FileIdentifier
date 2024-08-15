import React, { useState } from "react";
import axios from "axios";
import { SERVER_URL } from "../constants";
import {
  Typography,
  Box,
  TextField,
  Button,
  Link as MuiLink,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ShowMessage from "./Utils/snackbar";
import Loading from "./Loading/Loading";
import { useUser } from "../Context/userContext";

const textInputProps = {
  style: {
    borderRadius: "10px",
    border: "1px solid #A3AED0",
    "&:not(.Mui-disabled):before": {
      borderBottom: "none", // Remove the underline when not focused
    },
    "&:hover:not(.Mui-disabled):before": {
      borderBottom: "none", // Remove the underline when hovered
    },
    "&.Mui-focused:before": {
      borderBottom: "none",
    },
  },
};

const smallLabel = {
  variant: "body2",
  sx: {
    fontSize: "12px", // Set the font size of the label to 12px
    fontWeight: 600, // Set the font weight of the label to 600 (bold)
  },
};

export default function LoginForm() {
  const { setUser } = useUser(); // Use context to set user data
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [msg, setMsg] = useState("");
  const [severity, setSeverity] = useState("error");

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async () => {
    const { email, password } = credentials;
    if (!email || !password) {
      setErrors({ email: !email, password: !password });
      setMsg("Please fill in all fields");
      setOpenSnackBar(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${SERVER_URL}/api/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;

      // Save token and user data to local storage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Update context with user data
      setUser(user);

      setMsg("Login successful");
      setSeverity("success");
      setOpenSnackBar(true);

      navigate("/"); // Redirect to home or another page
    } catch (error) {
      console.error("Login failed:", error);
      setMsg("Invalid email or password");
      setSeverity("error");
      setOpenSnackBar(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box sx={{ minWidth: 400, maxWidth: 600 }}>
        <Loading loading={loading} />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: "36px" }}>
            Log in
          </Typography>
          <Typography sx={{ fontWeight: 400, fontSize: "18px", mb: 3 }}>
            Not registered yet?{" "}
            <MuiLink
              href="/signin"
              sx={{
                color: "#7F2DF1",
                textDecorationColor: "#7F2DF1",
                "&:hover": { color: "#7F2DF1", textDecorationColor: "#6b22b8" },
              }}
            >
              Create an Account
            </MuiLink>
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <TextField
            size="small"
            id="email"
            onChange={handleInputChange}
            label={
              <Typography {...smallLabel} sx={{ color: "#A3AED0" }}>
                Email
              </Typography>
            }
            fullWidth
            margin="normal"
            type="email"
            InputProps={textInputProps}
            error={Boolean(errors.email)}
            helperText={errors.email && "Email is required"}
          />

          <TextField
            size="small"
            id="password"
            onChange={handleInputChange}
            label={
              <Typography {...smallLabel} sx={{ color: "#A3AED0" }}>
                Password
              </Typography>
            }
            fullWidth
            margin="normal"
            type={showPassword ? "text" : "password"}
            InputProps={{
              ...textInputProps,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={Boolean(errors.password)}
            helperText={errors.password && "Password is required"}
          />
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}
          >
            <MuiLink
              href="forgotpassword"
              sx={{
                fontSize: "14px",
                color: "#707EAE",
                textDecoration: "none",
                m: 1,
                "&:hover": { color: "#7F2DF1", textDecorationColor: "#6b22b8" },
              }}
            >
              Forgot Password?
            </MuiLink>
          </Box>
        </Box>

        <Button
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: "#7F2DF1",
            borderRadius: "10px",
            mt: 2,
            textTransform: "none",
            fontSize: "16px",
            fontWeight: 700,
            boxShadow: "none",
            "&:hover": { backgroundColor: "#6b22b8", boxShadow: "none" },
          }}
          onClick={handleSubmit}
        >
          Login
        </Button>
      </Box>
      <ShowMessage
        openSnackBar={openSnackBar}
        severity={severity}
        message={msg}
        setOpenSnackBar={setOpenSnackBar}
      />
    </Box>
  );
}
