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
    const userId = jwtPayload?.userId;
    const user = await prisma.users.findFirst({ where: { userId } });

    if (user) {
      next(null, user);
    } else {
      next(null, false);
    }
  } catch (e) {
    const unauthorizedError = new Error("Unauthorized");
    unauthorizedError.status = 401;
    next(unauthorizedError, false);
  }
});

passport.use("jwt", strategy);

export { passport, jwtOptions };
