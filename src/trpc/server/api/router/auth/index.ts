import {
  createTRPCRouter,
  publicProcedure,
  privateProcedure,
  requireRoles,
} from "@/trpc/server";
import { loginSchema, signUpSchema, verifyUserSchema } from "./validation";
import { TRPCError } from "@trpc/server";
import { compare, hash } from "bcrypt";
import { addMinutesToDate, otpDigit } from "@/trpc/server/helper/otp-generator";
import { OtpQueue } from "@/queue/otpQueue";
import { getErrorMessage } from "@/trpc/server/constants/messages";
import passport from "passport";
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
} from "passport-jwt";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

// Passport JWT strategy setup
const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET as string,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      // Fetch user from DB
      const user = await import("@/trpc/server/db").then((m) =>
        m.prisma.user.findUnique({ where: { id: jwt_payload.userId } })
      );
      if (!user || !user.active) {
        return done(null, false, { message: "User not found or not active" });
      }
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  })
);

// Example usage: allow STORE_ADMIN or ADMIN
export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ ctx: { db }, input }) => {
      try {
        const { password, username } = input;

        const existUser = await db?.user.findFirst({
          where: { username },
        });

        if (existUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: getErrorMessage("authMessage", "signUp", "existUser"),
          });
        }

        const hashedPassword = await hash(
          password,
          Number(process.env.PASSWORD_SALT)
        );

        const user = await db?.user.create({
          data: { username, password: hashedPassword, role: "STORE_ADMIN" },
        });

        if (!user)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: getErrorMessage("authMessage", "signUp", "createUser"),
          });

        const code = otpDigit();
        const expiresAt = addMinutesToDate(3);

        await db?.otp.create({
          data: {
            otp: code,
            type: "SIGNUP",
            identifier: username,
            expiresAt,
            userId: user.id,
          },
        });
        const queue = new OtpQueue();

        queue.addJob({
          otp: code,
          userId: user.id,
          username,
        });

        return {
          username: user.username,
          userId: user.id,
        };
      } catch (err: unknown) {
        console.error(err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: getErrorMessage("authMessage", "signUp", "createUser"),
        });
      }
    }),
  login: publicProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    const { username, password } = input;
    const { db } = ctx;
    try {
      const user = await db?.user.findUnique({
        where: { username },
      });

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: getErrorMessage("authMessage", "signUp", "userNotFound"),
        });
      }

      const isValid = await compare(password, user.password);
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: getErrorMessage("authMessage", "signUp", "invalidPassword"),
        });
      }

      // Generate JWT token
      const jwtPayload = {
        userId: user.id,
        username: user.username,
        role: user.role,
      };
      const token = jwt.sign(jwtPayload, process.env.JWT_SECRET as string, {
        expiresIn: "7d",
      });

      return {
        token,
        username: user.username,
        userId: user.id,
        role: user.role,
      };
    } catch (err: unknown) {
      console.error(err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: getErrorMessage("authMessage", "signUp", "loginFailed"),
      });
    }
  }),
  verifyUser: publicProcedure
    .input(verifyUserSchema)
    .mutation(async ({ ctx: { db }, input }) => {
      const { username, otp } = input;
      // Find the OTP record
      const otpRecord = await db?.otp.findFirst({
        where: {
          identifier: username,
          otp,
          type: "SIGNUP",
          used: false,
          expiresAt: { gte: new Date() },
        },
      });
      if (!otpRecord) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid or expired OTP.",
        });
      }
      // Mark OTP as used
      await db?.otp.update({
        where: { id: otpRecord.id },
        data: { used: true },
      });
      // Activate the user
      const user = await db?.user.update({
        where: { username },
        data: { active: true },
      });
      return { success: true, userId: user?.id };
    }),

  // Admin-specific login for super admins only
  adminLogin: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      const { username, password } = input;
      const { db } = ctx;

      try {
        const user = await db?.user.findUnique({
          where: { username },
          include: {
            Profile: true,
          },
        });

        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid credentials. Access denied.",
          });
        }

        // Check if user is active
        if (!user.active) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Account is not active. Please contact support.",
          });
        }

        // Verify password
        const isValid = await compare(password, user.password);
        if (!isValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid credentials. Access denied.",
          });
        }

        // Check if user has ADMIN role
        if (user.role !== "ADMIN") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Access denied. Super admin privileges required.",
          });
        }

        // Generate JWT token with admin privileges
        const jwtPayload = {
          userId: user.id,
          username: user.username,
          role: user.role,
        };
        const token = jwt.sign(jwtPayload, process.env.JWT_SECRET as string, {
          expiresIn: "24h", // Shorter expiration for admin tokens
        });

        return {
          token,
          username: user.username,
          userId: user.id,
          role: user.role,
          profile: user.Profile,
        };
      } catch (err: unknown) {
        console.error("Admin login error:", err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Login failed. Please try again.",
        });
      }
    }),

  // Validate admin token and get current user info
  validateAdminToken: privateProcedure.query(async ({ ctx }) => {
    const { user, db } = ctx;

    try {
      // Check if user exists and is active
      const currentUser = await db?.user.findUnique({
        where: { id: user.id },
        include: {
          Profile: true,
        },
      });

      if (!currentUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found.",
        });
      }

      if (!currentUser.active) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Account is not active.",
        });
      }

      // Check if user has ADMIN role
      if (currentUser.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied. Super admin privileges required.",
        });
      }

      return {
        username: currentUser.username,
        userId: currentUser.id,
        role: currentUser.role,
        profile: currentUser.Profile,
      };
    } catch (err: unknown) {
      console.error("Admin token validation error:", err);
      if (err instanceof TRPCError) {
        throw err;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Token validation failed.",
      });
    }
  }),

  // Validate store admin token and get current user info
  validateStoreAdminToken: privateProcedure.query(async ({ ctx }) => {
    const { user, db } = ctx;

    try {
      // Check if user exists and is active
      const currentUser = await db?.user.findUnique({
        where: { id: user.id },
        include: {
          Profile: true,
        },
      });

      if (!currentUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found.",
        });
      }

      if (!currentUser.active) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Account is not active.",
        });
      }

      // Check if user has STORE_ADMIN role
      if (currentUser.role !== "STORE_ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access denied. Store admin privileges required.",
        });
      }

      return {
        username: currentUser.username,
        userId: currentUser.id,
        role: currentUser.role,
        profile: currentUser.Profile,
      };
    } catch (err: unknown) {
      console.error("Store admin token validation error:", err);
      if (err instanceof TRPCError) {
        throw err;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Token validation failed.",
      });
    }
  }),
});
