# 🍕 QuickEats - Food Delivery Platform

A comprehensive full-stack food delivery application built with React, Node.js, and MongoDB. QuickEats connects customers, restaurant owners, and delivery personnel in a seamless food delivery ecosystem.

![QuickEats Logo]([https://img.shields.io/badge/QuickEats-Food%20Delivery-orange?style=for-the-badge&logo=delivery](https://quickeats-abhay.onrender.com/))

## 🌟 Features

### 👥 Multi-Role System
- **Customers**: Browse restaurants, place orders, track deliveries
- **Restaurant Owners**: Manage menus, process orders, view analytics
- **Delivery Personnel**: Accept assignments, track deliveries, update status

### 🛒 Core Functionality
- **Smart Restaurant Discovery**: Location-based restaurant recommendations
- **Real-time Order Tracking**: Live updates on order status
- **Secure Payment Integration**: Razorpay payment gateway with COD option
- **Interactive Maps**: Leaflet integration for location services
- **Real-time Communication**: Socket.io for instant updates
- **Image Management**: Cloudinary integration for food images

### 🎨 User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI Components**: Radix UI components with custom styling
- **Smooth Animations**: Lottie animations for loading states
- **Intuitive Navigation**: Role-based dashboard routing

## 🚀 Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Leaflet** - Interactive maps
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **Lottie React** - Animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Image storage
- **Razorpay** - Payment processing
- **Nodemailer** - Email services

## 📁 Project Structure

```
QuickEats/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── redux/           # Redux store and slices
│   │   └── assets/          # Static assets
│   └── package.json
├── backend/                  # Node.js backend API
│   ├── controllers/         # Route controllers
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── middlewares/        # Custom middlewares
│   ├── utils/              # Utility functions
│   └── package.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/QuickEats.git
cd QuickEats
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/quickeats
JWT_SECRET=your_jwt_secret
CLOUDINARY_API_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_SERVER_URL=http://localhost:8000
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

Start the frontend development server:
```bash
npm run dev
```

## 🎯 Key Features Explained

### 🔐 Authentication System
- JWT-based authentication
- Role-based access control (User, Owner, Delivery Boy)
- Password reset functionality
- OTP verification system

### 🗺️ Location Services
- GeoJSON-based location storage
- 2dsphere indexing for efficient location queries
- Real-time location tracking
- Distance-based restaurant discovery

### 💳 Payment Integration
- Razorpay payment gateway
- Cash on Delivery (COD) option
- Secure payment verification
- Order confirmation system

### 📱 Real-time Features
- Live order status updates
- Real-time notifications
- Socket.io integration
- Delivery tracking

### 🏪 Restaurant Management
- Menu management system
- Order processing dashboard
- Analytics and reporting
- Image upload for food items

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or GitHub Pages

## 📱 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/forgot-password` - Password reset

### Orders
- `POST /api/order/place-order` - Create new order
- `GET /api/order/my-orders` - Get user orders
- `PUT /api/order/update-status` - Update order status

### Restaurants
- `GET /api/shop/shops-by-city` - Get restaurants by city
- `POST /api/shop/create-shop` - Create restaurant
- `GET /api/shop/my-shop` - Get owner's restaurant

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Abhay Chaurasia**
- GitHub: [@abhaychaurasia](https://github.com/abhaychaurasia)
- Email: abhaychaurasia122004@gmail.com

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the flexible database
- Tailwind CSS for the utility-first styling
- All open-source contributors

## 📞 Support

If you have any questions or need help, please feel free to:
- Open an issue on GitHub
- Contact the author directly
- Check the documentation

---

⭐ **Star this repository if you found it helpful!**
