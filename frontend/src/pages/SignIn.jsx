import React, { useEffect, useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Store, Bike } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { ClipLoader } from "react-spinners";
import { setUserData } from "../redux/userSlice";
import { useDispatch } from "react-redux";
import SEO from "../components/SEO";

const SignIn = () => {
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

  const roles = [
    { key: "user", label: "User", icon: <User size={18} /> },
    { key: "owner", label: "Owner", icon: <Store size={18} /> },
    { key: "deliveryBoy", label: "Delivery", icon: <Bike size={18} /> },
  ];

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-[#FDFDFD] relative overflow-hidden">
      <SEO title="Quick Eats | Sign In" description="Sign in to Quick Eats to order food." />

      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100 rounded-full blur-[100px] opacity-50 pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] opacity-50 pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-[2.5rem] border border-white/50 p-8 sm:p-10">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-500 font-medium">
              Sign in to continue to <span className="text-orange-500 font-bold">Quick Eats</span>
            </p>
          </div>

          {/* Role Toggle */}
          <div className="bg-gray-100 p-1.5 rounded-2xl flex relative mb-8">
            {roles.map((r) => (
              <button
                key={r.key}
                onClick={() => setRole(r.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative z-10 ${role === r.key
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                {r.icon} {r.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-gray-700 placeholder:font-normal placeholder:text-gray-400"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-gray-700 placeholder:font-normal placeholder:text-gray-400"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs font-bold text-orange-500 hover:text-orange-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full bg-[#111] text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-gray-200 hover:bg-orange-600 hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? <ClipLoader size={24} color="white" /> : (
                <>
                  Sign In <ArrowRight size={20} />
                </>
              )}
            </button>

            {/* Error Message */}
            {err && (
              <div className="p-3 rounded-lg bg-red-50 text-red-500 text-sm font-medium text-center border border-red-100 animate-shake">
                {err}
              </div>
            )}

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase">Or continue with</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-200 transition-all duration-200 flex items-center justify-center gap-3"
            >
              <FcGoogle size={24} />
              <span>Sign In with Google</span>
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-gray-500 font-medium mt-6">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-orange-500 font-bold hover:underline"
              >
                Sign Up
              </button>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
