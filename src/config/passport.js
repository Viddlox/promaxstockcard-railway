import passport from "passport";
import passportJWT from "passport-jwt";
import { prisma } from "../../prisma/prisma.js";
import { jwtSecret } from "./variables.js";

const { ExtractJwt, Strategy: JwtStrategy } = passportJWT;

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

const strategy = new JwtStrategy(jwtOptions, async (jwtPayload, next) => {
  try {
    const userId = jwtPayload?.id;
    const user = await prisma.users.findFirst({ 
      where: { userId },
      select: {
        userId: true,
        username: true,
        role: true,
        fullName: true
      }
    });

    if (user) {
      next(null, {
        userId: user.userId,
        role: user.role,
        username: user.username,
        fullName: user.fullName
      });
    } else {
      next(null, false);
    }
  } catch (e) {
    console.error('JWT Strategy Error:', e);
    const unauthorizedError = new Error("Unauthorized");
    unauthorizedError.status = 401;
    next(unauthorizedError, false);
  }
});

passport.use("jwt", strategy);

export { passport, jwtOptions };
