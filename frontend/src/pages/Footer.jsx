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
   <footer className="bg-gray-800 text-white mt-10">

  {/* Main Footer Content */}
  <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

      {/* App Info */}
      <div className="md:ml-15">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">QuickEats</h2>
          <p className="text-gray-300 mb-4">
            Fast, fresh, and reliable food delivery right at your doorstep. 
            Delicious meals from your favorite restaurants.
          </p>
          <div className="flex items-center space-x-2">
            <Leaf className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-300">Fresh & Quality Ingredients</span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className='md:pl-15'>
        <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
        <ul className="space-y-3">
          <li>
            <Link 
              to="/" 
              className="text-gray-300 hover:text-white transition-colors"
              onClick={scrollToTop}
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              to="/my-orders" 
              className="text-gray-300 hover:text-white transition-colors"
              onClick={scrollToTop}
            >
               My Orders
            </Link>
          </li>
          <li>
            <Link 
              to="/checkOut" 
              className="text-gray-300 hover:text-white transition-colors"
              onClick={scrollToTop}
            >
              Checkout
            </Link>
          </li>
        
          <li>
            <Link 
              to="/cart" 
              className="text-gray-300 hover:text-white transition-colors"
              onClick={scrollToTop}
            >
              Cart
            </Link>
          </li>
        </ul>
      </div>

      {/* Customer Support */}
      <div>
        <h4 className="text-lg font-semibold mb-6">Customer Support</h4>
        <ul className="space-y-3">
          <li>
            <Link 
              to="/contact" 
              className="text-gray-300 hover:text-white transition-colors"
              onClick={scrollToTop}
            >
              Help Center
            </Link>
          </li>
          <li>
            <Link 
              to="/contact"
              className="text-gray-300 hover:text-white transition-colors"
               onClick={scrollToTop}
            >
              Contact Us
            </Link>
          </li>
         
        </ul>
      </div>

      {/* Contact Info */}
      <div>
        <h4 className="text-lg font-semibold mb-6">Get in Touch</h4>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-[#ff4d2d] mt-0.5" />
            <div>
              <p className="text-gray-300">QuickEats HQ</p>
              <p className="text-gray-300">Agra, UP – 282002</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-[#ff4d2d]" />
            <a className="text-gray-300 hover:text-white transition-colors" href="tel:+919305505053">+91-9305505053‬</a>
          </div>
          
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-[#ff4d2d]" />
            <a className="text-gray-300 hover:text-white transition-colors" href="mailto:support@quickeats.com">support@quickeats.com</a>
          </div>
          
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-[#ff4d2d] mt-0.5" />
            <div>
              <p className="text-gray-300">Monday – Sunday: 8:00 AM – 11:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Bottom Footer */}
  <div className="bg-gray-900 border-t border-gray-700">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="text-center md:text-left">
          <p className="text-gray-400 text-sm">
            © 2025 QuickEats. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
          {/* Made with ❤️ for food lovers */}
          Made with ❤️ Abhay Chaurasia
        </div>
      </div>
    </div>
  </div>
</footer>

  )
}
