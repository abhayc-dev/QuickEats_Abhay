import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      const admin = new User({
        fullName: "Super Admin",
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        mobile: 9434954345,
        role: "admin",
      });
      await admin.save();
      console.log("✅ Admin account created: admin@gmail.com / admin");
    } else {
      console.log("ℹ️ Admin account already exists.");
    }
  } catch (error) {
    console.error("❌ Error seeding admin:", error.message);
  }
};

export default seedAdmin;
