import express from "express";
import path from "path";
import cors from "cors";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import morgan from "morgan";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

// API Routes

app.post("/api/auth/signup", async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const userExists = await prisma.user.findUnique({
      where: { email },
    });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const accesstoken = jwt?.sign({ email: email }, process.env.JWT_SECRET, {});
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        token: accesstoken,
      },
      select: {
        id: true,
        email: true,
        name: true,
        verified: true,
      },
    });

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Please verify your email",
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
            <div style="width: 100%; max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #333333; text-align: center;">Welcome to Our Service!</h2>
              <p style="color: #555555; text-align: center;">Thank you for signing up! Please click the button below to verify your email address and activate your account.</p>
              <div style="text-align: center; margin: 20px 0;">
                <a href="http://localhost:${PORT}/api/auth/verify/${token}" style="display: inline-block; padding: 15px 25px; font-size: 16px; color: #ffffff; background-color: #7F2DF1; text-decoration: none; border-radius: 5px;">Verify Email</a>
              </div>
              <p style="color: #555555; text-align: center;">If you did not sign up for this account, please ignore this email.</p>
              <footer style="text-align: center; margin-top: 20px; font-size: 12px; color: #999999;">
                <p>&copy; ${new Date().getFullYear()} Our Company. All rights reserved.</p>
                <p><a href="/privacy" style="color: #7F2DF1; text-decoration: none;">Privacy Policy</a> | <a href="/terms" style="color: #7F2DF1; text-decoration: none;">Terms of Service</a></p>
              </footer>
            </div>
          </body>
        </html>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ error: "Error sending email" });
      }
      res.status(200).json({
        success: "Signup successful, please verify your email",
        user: {
          ...newUser,
          token: token,
        },
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/resend-verification", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.verified) {
      return res.status(400).json({ message: "User is already verified." });
    }

    // Generate a new verification token
    const token = jwt.sign({ email: user?.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Please verify your email",
      html: `
          <html>
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
              <div style="width: 100%; max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #333333; text-align: center;">Welcome to Our Service!</h2>
                <p style="color: #555555; text-align: center;">Thank you for signing up! Please click the button below to verify your email address and activate your account.</p>
                <div style="text-align: center; margin: 20px 0;">
                  <a href="http://localhost:${PORT}/api/auth/verify/${token}" style="display: inline-block; padding: 15px 25px; font-size: 16px; color: #ffffff; background-color: #7F2DF1; text-decoration: none; border-radius: 5px;">Verify Email</a>
                </div>
                <p style="color: #555555; text-align: center;">If you did not sign up for this account, please ignore this email.</p>
                <footer style="text-align: center; margin-top: 20px; font-size: 12px; color: #999999;">
                  <p>&copy; ${new Date().getFullYear()} Our Company. All rights reserved.</p>
                  <p><a href="/privacy" style="color: #7F2DF1; text-decoration: none;">Privacy Policy</a> | <a href="/terms" style="color: #7F2DF1; text-decoration: none;">Terms of Service</a></p>
                </footer>
              </div>
            </body>
          </html>
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ error: "Error sending email" });
      }
      res.status(200).json({
        success: "Signup successful, please verify your email",
      });
    });

    return res.status(200).json({ message: "Verification email sent." });
  } catch (error) {
    console.error("Error sending verification email:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { email: user.email, id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Adjust the expiration as needed
    );

    // Respond with the token and user data
    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        verified: user.verified, // Include this if needed
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log(err);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

// Route to get user profile
app.post("/api/auth/profile", async (req, res) => {
  try {
    const { email } = req.body; // Extract email from the JWT token
    console.log(email);
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        verified: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
app.get("/api/auth/verify/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const user = await prisma.user.update({
      where: { email },
      data: { verified: true },
    });

    res.redirect("http://localhost:3000/"); // Redirect to login or any other page
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Invalid or expired token" });
  }
});

app.post("/");

// Catch-all handler for any request that doesn't match the API routes
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "client/build", "index.html"));
// });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
