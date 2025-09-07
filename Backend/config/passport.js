const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google-callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // try find by googleId
    let user = await User.findOne({ googleId: profile.id });

    // If no user with googleId, try by email to link accounts
    if (!user && profile.emails && profile.emails.length) {
      user = await User.findOne({ email: profile.emails[0].value.toLowerCase() });
    }

    if (!user) {
      // Create new user
      user = new User({
        googleId: profile.id,
        email: profile.emails?.[0]?.value?.toLowerCase(),
        name: profile.displayName,
        googleAccessToken: accessToken,
        googleRefreshToken: refreshToken || undefined
      });
    } else {
      // Link googleId if missing
      if (!user.googleId) user.googleId = profile.id;
      // Update tokens
      user.googleAccessToken = accessToken;
      if (refreshToken) user.googleRefreshToken = refreshToken;
    }

    await user.save();
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  const u = await User.findById(id);
  done(null, u);
});

module.exports = passport;