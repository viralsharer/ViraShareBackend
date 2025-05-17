// backend/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const passport = require('./config/passport');
const session = require('express-session');



// require('./config/passport');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();
const app = express();
// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET,
   
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));
  
  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());





// Middleware
// CORS setup
// const allowedOrigins = [process.env.FRONTEND_URL];

const allowedOrigins = [

  'https://www.virashare.io',
  'https://virashare.io',
  'https://app.virashare.io',
  'http://www.virashare.io',
  'http://virashare.io',
  'http://app.virashare.io'
];


app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());



// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoute'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/engagement-types', require('./routes/engagementTypeRoutes'));

app.use('/api/social-platform', require('./routes/socialPlatformRoutes'));
app.use('/api/packages', require('./routes/packageRoutes'));
app.use('/api/coupon', require('./routes/couponRoutes'));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


