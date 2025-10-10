import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDb from "./config/db.js";
import cors from "cors"; // <-- Keep this one
import cookieParser from "cookie-parser";
import authRouter from "./routers/auth.routes.js";
import userRouter from "./routers/user.routes.js";
import shopRouter from "./routers/shop.routes.js";
import itemRouter from "./routers/item.routes.js";
import orderRouter from "./routers/order.routes.js";
import http from "http";
import { Server } from "socket.io";
import { socketHandler } from "./socket.js";
import contactRouter from "./routers/contact.js";

const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);

// ✅ Setup Socket.IO 
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["POST", "GET", "PATCH"],
  },
});

// Attach io to app so routes/controllers can emit events
app.set("io", io);

// ✅ Middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ✅ Routes
app.use("/api/auth", authRouter); 
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);
app.use("/api/contact", contactRouter);

// ✅ Socket.IO handler
socketHandler(io);

// ✅  server.listen
server.listen(port, () => {
  connectDb();
  console.log(`🚀 Server started on http://localhost:${port}`);
});