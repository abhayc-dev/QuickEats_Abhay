import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config();

// Create a test account or replace with real credentials.
// Create a test account or replace with real credentials.
if (!process.env.EMAIL || !process.env.PASS) {
  console.error("CRITICAL ERROR: EMAIL or PASS environment variables are missing!");
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
  connectionTimeout: 10000, // Fail after 10s if cannot connect
});


// Helper to get formatted sender
const getSender = () => `Quick Eats <${process.env.EMAIL}>`;

export const sendOtpMail = async(to,otp) => {
    console.log(`[Mail] Sending Reset OTP to: ${to}`);
    await transporter.sendMail({
        from: getSender(),
        to,
        subject:"Reset Your Password",
        html:`<div style="font-family: sans-serif; padding: 20px;">
          <h2>Password Reset</h2>
          <p>Your OTP is: <b style="font-size: 24px; color: #ea580c;">${otp}</b></p>
          <p>Expires in 5 minutes.</p>
        </div>`
    })
}

//! New function to send delivery OTP
export const sendOtpToDelivery = async(user,otp) => {
    console.log(`[Mail] Sending Delivery OTP to: ${user.email}`);
    await transporter.sendMail({
        from: getSender(),
        to:user.email,
        subject:"Delivery Verification",
        html:`<div style="font-family: sans-serif; padding: 20px;">
          <h2>Delivery Verification</h2>
          <p>Share this PIN with the delivery partner:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #ea580c; margin: 20px 0;">
            ${otp}
          </div>
          <p>Valid for 5 minutes.</p>
        </div>`
    })
}