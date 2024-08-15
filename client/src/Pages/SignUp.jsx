import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../Context/userContext"; // Import the custom hook
import ShowMessage from "./Utils/snackbar";
import Loading from "./Loading/Loading";
import { SERVER_URL } from "../constants";
import {
  Box,
  Typography,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  TextField,
  Button,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const textInputProps = {
  style: {
    borderRadius: "10px",
    border: "1px solid #A3AED0",
    border: "none",
    "&:not(.Mui-disabled):before": {
      borderBottom: "none",
    },
    "&:hover:not(.Mui-disabled):before": {
      borderBottom: "none",
    },
    "&.Mui-focused:before": {
      borderBottom: "none",
    },
  },
};

const smallLabel = {
  variant: "body2",
  sx: {
    fontSize: "12px",
    fontWeight: 600,
  },
};

const textFields = [
  { label: "Name", type: "text", key: "name" },
  { label: "Email", type: "email", key: "email" },
  { label: "Password", type: "password", key: "password" },
];

export function SignUpForm() {
  const navigate = useNavigate();
  const { setUser } = useUser(); // Access the updateUser function
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [msg, setMsg] = useState("");
  const [severity, setSeverity] = useState("error");
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async () => {
    let isError = false;
    const newErrors = {};

    Object.keys(formValues).forEach((key) => {
      if (key !== "agreeToTerms" && !formValues[key]) {
        newErrors[key] = "This field is required";
        isError = true;
      }
    });

    if (!/^[a-zA-Z\s]*$/.test(formValues.name)) {
      newErrors.name = "Name should only contain alphabets and spaces";
      isError = true;
    }

    if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      newErrors.email = "Invalid email address";
      isError = true;
    }

    if (!formValues.agreeToTerms) {
      newErrors.agreeToTerms =
        "Please agree to the Terms of Use and Privacy Policy";
      isError = true;
    }

    if (isError) {
      setErrors(newErrors);
      setMsg("Please correct the errors and try again.");
      setOpenSnackBar(true);
      setSeverity("error");
    } else {
      await signUp(formValues);
    }
  };

  const signUp = async (formValues) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${SERVER_URL}/api/auth/signup`,
        formValues
      );
      if (response.status === 200) {
        setMsg("Signup successful, please check your email for verification.");
        console.log(response?.data?.user);
        setUser(response?.data?.user);
        setOpenSnackBar(true);
        setSeverity("success");
        // // Update the user context with the new user data
        // updateUser(response?.data?.user);
        navigate("/"); // Redirect to the home page
      } else if (response.status === 201) {
        setMsg("User already exists, please sign in.");
        setOpenSnackBar(true);
        setSeverity("error");
        navigate("/login");
      } else {
        setMsg("User already exists, please sign in.");
        setOpenSnackBar(true);
        setSeverity("error");
      }
    } catch (error) {
      setMsg("Internal Server Error");
      setOpenSnackBar(true);
      setSeverity("error");
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
      <Box maxWidth={400}>
        <Loading loading={loading} />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: "36px" }}>
            Create a Free Account
          </Typography>
          <Typography sx={{ fontWeight: 400, fontSize: "18px", mb: 3 }}>
            Already have an account?{" "}
            <MuiLink
              href="/signin"
              sx={{
                color: "#7F2DF1",
                textDecorationColor: "#7F2DF1",
                "&:hover": { color: "#7F2DF1", textDecorationColor: "#6b22b8" },
              }}
            >
              Sign in
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
          {textFields.map((field, index) => (
            <React.Fragment key={index}>
              <TextField
                label={
                  <Typography {...smallLabel} sx={{ color: "#A3AED0" }}>
                    {field.label}
                  </Typography>
                }
                fullWidth
                margin="normal"
                type={
                  field.type === "password" && showPassword
                    ? "text"
                    : field.type
                }
                InputProps={{
                  ...textInputProps,
                  endAdornment: field.type === "password" && (
                    <InputAdornment position="end">
                      <IconButton onClick={handleShowPassword}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                size="small"
                onChange={(e) => handleChange(field.key, e.target.value)}
                error={Boolean(errors[field.key])}
                helperText={errors[field.key]}
              />
            </React.Fragment>
          ))}
          <FormControlLabel
            sx={{ alignSelf: "flex-start", mt: 1, color: "#A3AED0" }}
            control={
              <Checkbox
                checked={formValues.agreeToTerms}
                onChange={(e) => handleChange("agreeToTerms", e.target.checked)}
                sx={{
                  borderRadius: "10px",
                  color: "#7F2DF1",
                  "&.Mui-checked": { color: "#7F2DF1" },
                }}
              />
            }
            label={
              <Typography {...smallLabel}>
                I agree to the{" "}
                <MuiLink
                  href="/terms"
                  sx={{
                    color: "#7F2DF1",
                    textDecorationColor: "#7F2DF1",
                    "&:hover": {
                      color: "#7F2DF1",
                      textDecorationColor: "#6b22b8",
                    },
                  }}
                >
                  Terms of Use
                </MuiLink>{" "}
                and{" "}
                <MuiLink
                  href="/privacy"
                  sx={{
                    color: "#7F2DF1",
                    textDecorationColor: "#7F2DF1",
                    "&:hover": {
                      color: "#7F2DF1",
                      textDecorationColor: "#6b22b8",
                    },
                  }}
                >
                  Privacy Policy
                </MuiLink>
              </Typography>
            }
            error={Boolean(errors.agreeToTerms)}
            helperText={errors.agreeToTerms}
          />
        </Box>

        <Button
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: "#7F2DF1",
            borderRadius: "10px",
            mt: 2,
            boxShadow: "none",
            textTransform: "none",
            fontSize: "16px",
            fontWeight: 700,
            "&:hover": {
              backgroundColor: "#6b22b8",
              boxShadow: "none",
            },
          }}
          onClick={handleSubmit}
        >
          Sign Up
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
