import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.js";
import dotenv from "dotenv";

dotenv.config();

// console.log('Google Auth Config:', {
//   clientID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing',
//   callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3000'}/auth/google/callback`
// });

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${
        process.env.BACKEND_URL || "http://localhost:3000"
      }/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      // console.log("Google Auth profile:", profile ? profile.id : "No profile");
      try {
        const { id: googleId, displayName: name, emails, photos } = profile;
        const email = emails[0].value;
        const photo = photos[0].value;

        // upsert user in database
        const [user, created] = await User.findOrCreate({
          where: { googleId },
          defaults: {
            name,
            email,
            photo,
            status: "pending",
          },
        });

        if (!created) {
          await user.update({
            name,
            email,
            photo,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  if (user.role === "admin") {
    done(null, "admin");
  } else {
    done(null, user.id);
  }
});

passport.deserializeUser(async (id, done) => {
  if (id === "admin") {
    const adminUser = {
      id: "admin",
      email: process.env.ADMIN_EMAIL,
      role: "admin",
    };
    return done(null, adminUser);
  }
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
