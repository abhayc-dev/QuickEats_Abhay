import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone, Store, Bike, Sparkles } from "lucide-react";
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

  const handleGoogleAuth = async () => {
    if (!mobile) {
      return setErr("Mobile number is required for Google Sign Up");
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

  const roles = [
    { key: "user", label: "User", icon: <User size={18} /> },
    { key: "owner", label: "Owner", icon: <Store size={18} /> },
    { key: "deliveryBoy", label: "Delivery", icon: <Bike size={18} /> },
  ];

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-[#FDFDFD] relative overflow-hidden">
      <SEO title="Quick Eats | Sign Up" description="Create an account on Quick Eats." />

      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-orange-100 rounded-full blur-[100px] opacity-50 pointer-events-none -translate-y-1/2 -translate-x-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] opacity-50 pointer-events-none translate-y-1/2 translate-x-1/2"></div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-[2.5rem] border border-white/50 p-8 sm:p-10">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight flex items-center justify-center gap-2">
              Join Us <Sparkles className="text-orange-500 fill-orange-500" size={24} />
            </h1>
            <p className="text-gray-500 font-medium">
              Create your account to start your journey with <span className="text-orange-500 font-bold">Quick Eats</span>
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

          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-gray-700 placeholder:font-normal placeholder:text-gray-400"
                  placeholder="Your Name"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-gray-700 placeholder:font-normal placeholder:text-gray-400"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Mobile */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Mobile</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input
                  type="number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-gray-700 placeholder:font-normal placeholder:text-gray-400"
                  placeholder="1234567890"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-orange-500 focus:bg-white outline-none transition-all font-bold text-gray-700 placeholder:font-normal placeholder:text-gray-400"
                  placeholder="Create password"
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
            </div>

            {/* Error Message */}
            {err && (
              <div className="p-3 rounded-lg bg-red-50 text-red-500 text-sm font-medium text-center border border-red-100 animate-shake">
                {err}
              </div>
            )}

            {/* Sign Up Button */}
            <button
              onClick={handleSignUp}
              disabled={loading}
              className="w-full bg-[#111] text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-gray-200 hover:bg-orange-600 hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <ClipLoader size={24} color="white" /> : (
                <>
                  Create Account <ArrowRight size={20} />
                </>
              )}
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase">Or join with</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-100 text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-200 transition-all duration-200 flex items-center justify-center gap-3"
            >
              <FcGoogle size={24} />
              <span>Sign Up with Google</span>
            </button>

            {/* Sign In Link */}
            <p className="text-center text-gray-500 font-medium py-2">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/signin")}
                className="text-orange-500 font-bold hover:underline"
              >
                Sign In
              </button>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
