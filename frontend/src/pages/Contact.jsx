import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from "lucide-react";
import { serverUrl } from "@/config";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const ContactUs = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${serverUrl}/api/contact/contactUs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setFormData({ name: "", email: "", message: "" });
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (err) {
      alert("Server error, try again later");
      console.error(err);
    }
  };

  return (
    <>
      {/* //! Back Button */}
      <div className="absolute z-20 flex items-center gap-2 bg-gradient-to-b from-black/40 to-black/30 px-2 py-1 m-2 bg-amber-50 rounded-full hover:scale-105 transition-transform ">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-50 font-semibold"
        >
          <ArrowLeft size={20} />
          Back
        </button>
      </div>
      <section className="relative py-20 bg-[#FAF9F6]">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge
              variant="secondary"
              className="bg-red-100 text-[#ff4d2d] mb-4"
            >
              🍔 Food Delivery Support
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              CONTACT <span className="text-[#ff4d2d]">US</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Questions about your order, feedback on restaurants, or app
              support? We're here to help you get your food faster and fresher!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left side: Contact Cards + Map */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center space-x-4 mb-2">
                  <MapPin className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-semibold">Address</h3>
                </div>
                <p className="text-gray-600 ml-10">
                  QuickEats HQ
                  <br />
                  Agra, UP – 282002
                </p>
              </div>
              <div className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center space-x-4 mb-2">
                  <Phone className="w-6 h-6 text-orange-600" />
                  <h3 className="text-lg font-semibold">Call Us</h3>
                </div>
                <p className="text-gray-600 ml-10">+91-9305505053</p>
              </div>
              <div className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center space-x-4 mb-2">
                  <Mail className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold">Email</h3>
                </div>
                <p className="text-gray-600 ml-10">support@quickeats.com</p>
              </div>
              <div className="w-full h-64 rounded-3xl overflow-hidden shadow-inner">
                <iframe
                  title="QuickEats HQ Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.701628932836!2d78.00807547554287!3d27.17667007648717!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3974763a7c2b2fdf%3A0x9b5b0b0d7a9b8b2f!2sAgra%2C%20Uttar%20Pradesh%20282002!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-red-100 p-2 rounded-full">
                    <MessageCircle className="w-5 h-5 text-[#ff4d2d]" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Send us a Message
                  </h3>
                </div>
                <p className="text-gray-600">
                  Fill out the form with your question or feedback, and our team
                  will respond promptly.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent transition-all"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full h-30 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent transition-all resize-none"
                    placeholder="Tell us about your order or feedback..."
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#ff4c2dee] hover:bg-[#ff4c2d] text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 cursor-pointer"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </form>
            </div>
          </div>

          {/* Why Choose Section */}
          <div className="mt-20 text-center">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
              Why <span className="text-[#ff4d2d]">Choose</span> QuickEats?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition">
                <Phone className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <h4 className="font-semibold text-lg mb-1">Fast Delivery</h4>
                <p className="text-gray-600 text-sm">
                  Hot meals delivered to your door quickly.
                </p>
              </div>

              <div className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition">
                <Mail className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <h4 className="font-semibold text-lg mb-1">24/7 Support</h4>
                <p className="text-gray-600 text-sm">
                  Our team is always available to help.
                </p>
              </div>

              <div className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition">
                <Clock className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <h4 className="font-semibold text-lg mb-1">Reliable Service</h4>
                <p className="text-gray-600 text-sm">
                  Consistent delivery and order accuracy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactUs;
