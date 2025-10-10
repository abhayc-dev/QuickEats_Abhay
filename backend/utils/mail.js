import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config();

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});


export const sendOtpMail = async(to,otp) => {
    await transporter.sendMail({
        from:process.env.EMAIL,
        to,
        subject:"Reset Your Password",
        html:`<p>Your OTP for password reset is <b>${otp}</b>. It expire in 5 minutes.</p>`
    })
}

//! New function to send delivery OTP
export const sendOtpToDelivery = async(user,otp) => {
    await transporter.sendMail({
        from:process.env.EMAIL,
        to:user.email,
        subject:"Delivery OTP",
        html:`<p>Your OTP for Delivery is <b>${otp}</b>. It expire in 5 minutes.</p>`
    })
}