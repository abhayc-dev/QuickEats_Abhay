//! SignUp Page

import React, { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { ClipLoader } from "react-spinners";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import SEO from "../components/SEO";

const SignUp = () => {
  const primaryColor = "#ff4d2d";
  const cardBorderColor = "#E0D5B9";
  const inputBorderColor = "#9CCC65";

  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user");
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const [err, setErr] = useState("");

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        {
          fullName,
          email,
          mobile,
          password,
          role,
        },
        { withCredentials: true }
      );
      dispatch(setUserData(result.data));
      setErr("");
      setLoading(false);
    } catch (error) {
      setErr(error?.response?.data?.message);
      setLoading(false);
    }
  };

  //! logic for signup with google
  const handleGoogleAuth = async () => {
    if (!mobile) {
      return setErr("mobile number is required");
    }
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    try {
      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullName: result.user.displayName,
          email: result.user.email,
          role,
          mobile,
        },
        { withCredentials: true }
      );
      dispatch(setUserData(data));
      setErr("");
    } catch (error) {
      setErr(error?.response?.data?.message);
    }
  };

  return (
    <div className="m-full min-h-screen w-full flex items-center justify-center p-4 bg-[#FAF9F6]">
      <SEO title="Quick Eats | Sign Up" description="Create an account on Quick Eats." />
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 border-[1px]"
        style={{
          border: `1px solid ${cardBorderColor}`,
        }}
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: primaryColor }}>
          Vicky Sweet House
        </h1>

        <p className="text-gray-600 mb-8">
          Create your account to get started with delicious food deliveries
        </p>

        {/* //! Full Name */}
        <div className="mb-4">
          <label htmlFor="fullName" className="block font-medium mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500"
            placeholder="Enter your full name"
            style={{ borderColor: inputBorderColor }}
            required
          />
        </div>

        {/* //! Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block font-medium mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500"
            placeholder="you@example.com"
            style={{ borderColor: inputBorderColor }}
            required
          />
        </div>

        {/* //! Mobile */}
        <div className="mb-4">
          <label htmlFor="mobile" className="block font-medium mb-1">
            Mobile
          </label>
          <input
            type="number"
            id="mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500"
            placeholder="Enter your mobile number"
            style={{ borderColor: inputBorderColor }}
            required
          />
        </div>

        {/* //! Password */}
        <div className="mb-6">
          <label htmlFor="password" className="block font-medium mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-500"
              placeholder="Enter your password"
              style={{ borderColor: inputBorderColor }}
              required
            />
            <button
              type="button"
              className="absolute right-3 cursor-pointer top-[14px] text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
        </div>

        {/* //! role */}
        <div className="mb-4">
          <label htmlFor="role" className="block font-medium mb-1">
            Role
          </label>
          <div className="flex gap-2">
            {["user", "owner", "deliveryBoy"].map((r) => (
              <button
                className="flex-1 border rounded-lg px-2 py-2 text-center font-medium transition-colors cursor-pointer"
                onClick={() => setRole(r)}
                style={
                  role == r
                    ? { backgroundColor: primaryColor, color: "white" }
                    : { border: `1 px ${primaryColor}`, color: primaryColor }
                }
                key={r}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* //! Submit Button */}
        <button
          type="submit"
          className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}
          onClick={handleSignUp}
          disabled={loading}
        >
          {loading ? <ClipLoader size={20} color="white" /> : "Sign Up"}
        </button>
        {err && <p className="text-red-500 text-center my-[10px]">*{err}</p>}

        <button
          className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 border-gray-400 hover:bg-gray-100 cursor-pointer"
          onClick={handleGoogleAuth}
        >
          <FcGoogle size={20} />
          <span>Sign up with Google</span>
        </button>
        <p
          className="text-center mt-4 cursor-pointer"
          onClick={() => navigate("/signin")}
        >
          Already have an account ?{" "}
          <span className="text-[#ff4d2d]">Sign In</span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
