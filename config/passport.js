// backend/config/passport.js
const passport = require('passport');
// const DiscordStrategy = require('passport-discord').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;



const User = require('../models/User');

// Configure Discord OAuth strategy
// passport.use(new DiscordStrategy({
//   clientID: process.env.DISCORD_CLIENT_ID,
//   clientSecret: process.env.DISCORD_CLIENT_SECRET,
//   callbackURL: '/auth/discord/callback',
//   scope: ['identify', 'email']
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     let user = await User.findOne({ providerId: profile.id });

//     if (!user) {
//       // First-time login, create user
//       user = new User({
//         provider: 'discord',
//         providerId: profile.id,
//         name: profile.username,
//         email: profile.email, // email may not always be available
//         photo: profile.avatar,
//         balance: 3, // Add initial balance for first login
//       });
//       await user.save();
//     } else {
//       // Increment balance if user logs in again
    
//     }

//     return done(null, user);
//   } catch (err) {
//     return done(err, null);
//   }
// }));

function generateReferralCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let referralCode = '';
  for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      referralCode += characters[randomIndex];
  }
  return referralCode;
}

// Example usage:
const referralCode = generateReferralCode();
// passport.use(new TwitterStrategy({
//   consumerKey: 'TwpQT6VHV3EddoNUZDvGltsn3',
//   consumerSecret: 'OQNBp9d5wfr57BHEMRWbeZ7iAoIVcuikIz5u0KXWEJsjsFaM2v',
//   callbackURL: 'http://localhost:5000/api/auth/twitter/callback',
//   // callbackURL: '/twitter/callback',
  
// }, (token, tokenSecret, profile, done) => {
//     console.log('Profile:', profile);
//     console.log('Token:', token);
//     console.log('TokenSecret:', tokenSecret);
    
//     if (!profile) {
//         console.error('Error: No profile returned from Twitter');
//         return done(new Error('No profile returned'), null);
//     }

//     return done(null, profile);
// }));



// Configure Twitter OAuth strategy

passport.use(new TwitterStrategy({
  consumerKey: 'TwpQT6VHV3EddoNUZDvGltsn3',
  consumerSecret: 'OQNBp9d5wfr57BHEMRWbeZ7iAoIVcuikIz5u0KXWEJsjsFaM2v',
  callbackURL: 'http://localhost:5000/api/auth/twitter/callback',
}, async (token, tokenSecret, profile, done) => {
  try {
    let user = await User.findOne({ providerId: profile.id });

    if (!user) {
      // First-time login, create user
      user = new User({
        provider: 'twitter',
        providerId: profile.id,
        name: profile.displayName,
        photo: profile.photos[0].value,
        balance: 3,
        referralCode:referralCode,
      });
      await user.save();
    } else {
      // Increment balance if user logs in again
      user.balance += 3;
      await user.save();
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));



// Serialize and deserialize user for session handling
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    // Retrieve the full user object from the database using the ID stored in the session
    const user = await User.findById(id).exec();
    if (!user) {
      return done(new Error('User not found'), null);
    }
    done(null, user); // Attach user to req.user
  } catch (err) {
    done(err, null); // Handle any errors
  }
});

module.exports = passport
