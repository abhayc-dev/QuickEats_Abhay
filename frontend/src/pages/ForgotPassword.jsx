//! Forget Password Page 

import React, { useState } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../config";
import axios from "axios";
import { ClipLoader } from "react-spinners"

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

   const [err, setErr] = useState("");

  const navigate = useNavigate();


  //! Step-1 send otp
  const handleSendOtp = async () => {
     setLoading(true)
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withCredentials: true }
      );
      console.log(result);
      setErr("")
      setLoading(false)
      setStep(2);
    } catch (error) {
       setErr(error?.response?.data?.message)
       setLoading(false)
    }
  };

  //! step-2 Verify otp
  const handleVerifyOtp = async () => {
    setLoading(true)
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );
      console.log(result);
      setErr("")
      setLoading(false)
      setStep(3);
    } catch (error) {
      setErr(error?.response?.data?.message)
      setLoading(false)
    }
  };

  //! step-3 reset password
  const handleResetPassword = async () => {
    setLoading(true)
    if(newPassword != confirmPassword){
        return null
    }
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        { email, newPassword },
        { withCredentials: true }
      );
      console.log(result);
      setErr("")
      setLoading(false)
      navigate("/signin")
    } catch (error) {
       setErr(error?.response?.data?.message)
       setLoading(false)
    }
  };

  return (
    <div className="flex w-full items-center justify-center min-h-screen p-4 bg-[#FAF9F6] ">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
        <div className="flex items-center space-x-2 mb-4 cursor-pointer">
          <IoMdArrowBack
            size={30}
            className="text-[#ff4d2d]"
            onClick={() => navigate("/signin")}
          />
          <h1 className="text-2xl font-bold text-center text-[#ff4d2d]">
            Forgot Password
          </h1>
        </div>

     //! Step 1 Enter Email
        {step == 1 && (
          <div>
            <div className="mb-4">
              <label htmlFor="email" className="block font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500 border-[1px] border-gray-200"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* //! Submit Button */}
            <button
              type="submit"
              className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}
              onClick={handleSendOtp}
              disabled={loading}
            >
                {loading? <ClipLoader size={20} color="white"/> : "Send OTP"}
            </button>
            {err && <p className="text-red-500 text-center my-[10px]">*{err}</p>}
          </div>
        )}

      //! Step 2 Enter Otp
        {step == 2 && (
          <div>
            <div className="mb-4">
              <label htmlFor="otp" className="block font-medium mb-1">
                OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500 border-[1px] border-gray-200"
                placeholder="Enter OTP"
                required
              />
            </div>

            {/* //!Submit Button */}
            <button
              type="submit"
              className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}
              onClick={handleVerifyOtp}
              disabled={loading}
            >
                {loading? <ClipLoader size={20} color="white"/> : "Verify OTP"}
              
            </button>
           {err && <p className="text-red-500 text-center my-[10px]">*{err}</p>}
          </div>
        )}

      //! Step 3 enter New Password
        {step == 3 && (
          <div>
            <div className="mb-4">
              <label htmlFor="newPassword" className="block font-medium mb-1">
                New Password
              </label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500 border-[1px] border-gray-200"
                placeholder="Enter New Password"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="confirmPassword"
                className="block font-medium mb-1"
              >
                Confirm Password
              </label>
              <input
                type="text"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500 border-[1px] border-gray-200"
                placeholder="Confirm Password"
                required
              />
            </div>
            
            {/* //!Submit Button */}
            <button
              type="submit"
              className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}
              onClick={handleResetPassword}
              disabled={loading}
            >
                {loading? <ClipLoader size={20} color="white"/> : "Reset Password"}
             
            </button>
            {err && <p className="text-red-500 text-center my-[10px]">*{err}</p>}
          </div>
        )}
      </div>

    </div>
  );
};

export default ForgotPassword;
