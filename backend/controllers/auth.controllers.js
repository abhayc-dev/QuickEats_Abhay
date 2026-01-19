import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import getToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";

//! Helper function to set cookie properly
const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true";
  
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction, // HTTPS only in production (required for SameSite=None)
    sameSite: isProduction ? "none" : "lax", // Cross-site access allowed in prod
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

//! ------------------- Sign Up -------------------
export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, mobile, role } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists." });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters." });

    if (mobile.length < 10)
      return res.status(400).json({ message: "Mobile number must be at least 10 digits." });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({ fullName, email, role, mobile, password: hashedPassword });

    const token = await getToken(user._id);
    setAuthCookie(res, token);

    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ error: `signUp error: ${error.message}` });
  }
};

//! ------------------- Sign In -------------------
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User does not exist." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password." });

    const token = await getToken(user._id);
    setAuthCookie(res, token);

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: `signIn error: ${error.message}` });
  }
};

//! ------------------- Sign Out -------------------
export const signOut = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true";
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ error: `signOut error: ${error.message}` });
  }
};

//! ------------------- Send OTP -------------------
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User does not exist." });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.isOtpVerified = false;
    await user.save();

    await sendOtpMail(email, otp);
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    return res.status(500).json({ error: `send otp error: ${error.message}` });
  }
};

//! ------------------- Verify OTP -------------------
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.resetOtp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    return res.status(500).json({ error: `verify otp error: ${error.message}` });
  }
};

//! ------------------- Reset Password -------------------
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.isOtpVerified) {
      return res.status(400).json({ message: "OTP verification required" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.isOtpVerified = false;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ error: `reset password error: ${error.message}` });
  }
};

//! ------------------- Google Auth -------------------
export const googleAuth = async (req, res) => {
  try {
    const { fullName, email, mobile, role } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ fullName, email, mobile, role });
    }

    const token = await getToken(user._id);
    setAuthCookie(res, token);

    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ error: `googleAuth error: ${error.message}` });
  }
};
