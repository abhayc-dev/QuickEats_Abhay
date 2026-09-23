import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    mobile: {
      type: Number,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "owner", "deliveryBoy", "admin"],
      required: true,
    },
    resetOtp: {
      type: String,
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
    otpExpires: {
      type: Date,
    },
        // ✅ location GeoJSON ke liye
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    // ✅  socket
    socketId: { type: String, default: null },
    isOnline: { type: Boolean, default: false },

    // ✅ Expo push tokens, for alerting owners of new orders when their app
    // is backgrounded or closed (sockets only reach an open, connected app).
    // An array since the same account can be signed in on more than one
    // device.
    expoPushTokens: { type: [String], default: [] },
  },
  { timestamps: true }
);

//! MongoDB understand the geojson formate
userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);
export default User;
