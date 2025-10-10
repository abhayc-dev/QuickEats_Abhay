import Contact from "../models/Contact.js";

// POST /api/contact
export const submitContactForm = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const contact = new Contact({ name, email, message });
    await contact.save();
    res.status(201).json({ message: "Message submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
