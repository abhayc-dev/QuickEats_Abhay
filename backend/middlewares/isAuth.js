import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token not found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Token invalid" });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ message: `Auth failed: ${error.message}` });
  }
};

export default isAuth;
