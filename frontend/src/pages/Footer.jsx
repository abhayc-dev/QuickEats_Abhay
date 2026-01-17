import { Link } from 'react-router-dom'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Leaf
} from 'lucide-react'

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
  // Fallback for better browser compatibility
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

export default function Footer() {
  return (
    <footer className="w-full bg-[#0f172a] text-white mt-10 font-sans tracking-wide">

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* App Info */}
          <div className="flex flex-col gap-4">
            <h1
        className="text-2xl md:text-3xl font-black tracking-tight cursor-pointer flex items-center gap-1"
        onClick={() => navigate("/")}
      >
        <span className="text-orange-800">Quick</span><span className="text-yellow-700">Eats</span>
      </h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Fast, fresh, and reliable food delivery right at your doorstep.
              Delicious meals from your favorite restaurants.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Leaf className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-300">Fresh & Quality Ingredients</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:ml-8">
            <h4 className="text-lg font-bold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white transition-all text-sm font-medium"
                  onClick={scrollToTop}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/my-orders"
                  className="text-gray-400 hover:text-white transition-all text-sm font-medium"
                  onClick={scrollToTop}
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  to="/checkOut"
                  className="text-gray-400 hover:text-white transition-all text-sm font-medium"
                  onClick={scrollToTop}
                >
                  Checkout
                </Link>
              </li>

              <li>
                <Link
                  to="/cart"
                  className="text-gray-400 hover:text-white transition-all text-sm font-medium"
                  onClick={scrollToTop}
                >
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Customer Support</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white transition-all text-sm font-medium"
                  onClick={scrollToTop}
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white transition-all text-sm font-medium"
                  onClick={scrollToTop}
                >
                  Contact Us
                </Link>
              </li>

            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Get in Touch</h4>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#ff4d2d] shrink-0" />
                <div className="text-sm text-gray-400">
                  <p>QuickEats HQ</p>
                  <p>Agra, UP – 282002</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#ff4d2d] shrink-0" />
                <a className="text-gray-400 hover:text-white transition-all text-sm" href="tel:+919305505053">+91-9305505053‬</a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#ff4d2d] shrink-0" />
                <a className="text-gray-400 hover:text-white transition-all text-sm" href="mailto:support@quickeats.com">support@quickeats.com</a>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#ff4d2d] shrink-0" />
                <p className="text-gray-400 text-sm">Monday – Sunday: 8:00 AM – 11:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-[#020617] border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs">
              © 2026 QuickEats. All rights reserved.
            </p>
            <div className="text-gray-400 text-sm font-medium flex items-center gap-1">
              Made with <span className="text-red-500">❤️</span> by Abhay Chaurasia
            </div>
          </div>
        </div>
      </div>
    </footer>

  )
}
