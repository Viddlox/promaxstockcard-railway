const passport = require("passport");
const passportJWT = require("passport-jwt");
const { jwtSecret } = require("./variables");
const { PrismaClient } = require("@prisma/client");

const { ExtractJwt, Strategy: JwtStrategy } = passportJWT;

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

const strategy = new JwtStrategy(jwtOptions, async (jwtPayload, next) => {
  try {
    const prisma = new PrismaClient();
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

module.exports = passport;
