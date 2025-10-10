//! SignIn Page

import React, { useEffect, useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { ClipLoader } from "react-spinners";
import { setUserData } from "../redux/userSlice";
import { useDispatch } from "react-redux";

const SignIn = () => {
  const primaryColor = "#ff4d2d";
  const cardBorderColor = "#E0D5B9";
  const inputBorderColor = "#9CCC65";
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const { role: routeRole } = useParams();
  const location = useLocation();
  const [role, setRole] = useState(routeRole || "user");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signin`,
        {
          email,
          password,
          role,
        },
        { withCredentials: true }
      );
      dispatch(setUserData(result.data));
      setErr("");
      setLoading(false);
      const params = new URLSearchParams(location.search);
      const redirectTo = params.get("redirect") || "/";
      navigate(redirectTo);
    } catch (error) {
      setErr(error?.response?.data?.message);
      setLoading(false);
    }
  };

  //! logic for signup with google
  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    try {
      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          email: result.user.email,
          role,
        },
        { withCredentials: true }
      );
      dispatch(setUserData(data));
      setErr("");
      const params = new URLSearchParams(location.search);
      const redirectTo = params.get("redirect") || "/";
      navigate(redirectTo);
    } catch (error) {
      setErr(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    if (routeRole && routeRole !== role) setRole(routeRole);
  }, [routeRole]);

  return (
    <div className="m-full min-h-screen w-full flex items-center justify-center p-4 bg-[#FAF9F6]">
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
          Sign In to your account to get started with delicious food deliveries
        </p>

        <div className="mb-4">
          <label className="block font-medium mb-1">Sign in as</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "user", label: "User" },
              { key: "owner", label: "Owner" },
              { key: "deliveryBoy", label: "Delivery" },
            ].map((r) => (
              <button
                key={r.key}
                type="button"
                className={`border rounded-lg py-2 ${
                  role === r.key
                    ? "bg-[#ff4d2d] text-white border-[#ff4d2d]"
                    : "bg-white"
                }`}
                onClick={() => setRole(r.key)}
              >
                {r.label}
              </button>
            ))}
          </div>
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
          <div
            className="text-right mb-2 text-[#ff4d2d] mt-2 font-medium cursor-pointer"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password
          </div>
        </div>

        {/* //! Submit Button */}
        <button
          type="submit"
          className={`w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}
          onClick={handleSignIn}
        >
          {loading ? <ClipLoader size={20} color="white" /> : "Sign In"}
        </button>

        {err && <p className="text-red-500 text-center my-[10px]">*{err}</p>}

        <button
          className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 border-gray-400 hover:bg-gray-100 cursor-pointer"
          onClick={handleGoogleAuth}
          disabled={loading}
        >
          <FcGoogle size={20} />
          <span>Sign In with Google</span>
        </button>
        <p
          className="text-center mt-4 cursor-pointer"
          onClick={() => navigate("/signup")}
        >
          Want to create a new account ?{" "}
          <span className="text-[#ff4d2d]">Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
