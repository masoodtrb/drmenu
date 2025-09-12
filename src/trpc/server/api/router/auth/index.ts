import { Role } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import {
  ExtractJwt,
  Strategy as JwtStrategy,
  StrategyOptions,
} from 'passport-jwt';
import { z } from 'zod';

import { redisConnection } from '@/database/redis';
import { OtpQueue } from '@/queue/otpQueue';
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
  requireRoles,
} from '@/trpc/server';
import { getErrorMessage } from '@/trpc/server/constants/messages';
import { addMinutesToDate, otpDigit } from '@/trpc/server/helper/otp-generator';
import { generateSecureToken } from '@/trpc/server/helper/token-generator';

import { TRPCError } from '@trpc/server';

import {
  loginSchema,
  loginWithOTPSchema,
  resetPasswordSchema,
  signUpSchema,
  verifyPasswordResetOTPSchema,
  verifyUserSchema,
} from './validation';

// Passport JWT strategy setup
const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET as string,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      // Fetch user from DB
      const user = await import('@/trpc/server/db').then(m =>
        m.prisma.user.findUnique({ where: { id: jwt_payload.userId } })
      );
      if (!user || !user.active) {
        return done(null, false, { message: 'User not found or not active' });
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
            code: 'CONFLICT',
            message: getErrorMessage('authMessage', 'signUp', 'existUser'),
          });
        }

        const hashedPassword = await hash(
          password,
          Number(process.env.PASSWORD_SALT)
        );

        const user = await db?.user.create({
          data: { username, password: hashedPassword, role: 'STORE_ADMIN' },
        });

        if (!user)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: getErrorMessage('authMessage', 'signUp', 'createUser'),
          });

        const code = otpDigit();
        const token = generateSecureToken();
        const expiresAt = addMinutesToDate(3);

        await db?.otp.create({
          data: {
            otp: code,
            token,
            type: 'SIGNUP',
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
          type: 'SIGNUP',
        });

        return {
          username: user.username,
          userId: user.id,
          token,
        };
      } catch (err: unknown) {
        console.error(err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: getErrorMessage('authMessage', 'signUp', 'createUser'),
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
          code: 'UNAUTHORIZED',
          message: getErrorMessage('authMessage', 'signUp', 'userNotFound'),
        });
      }

      const isValid = await compare(password, user.password);
      if (!isValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: getErrorMessage('authMessage', 'signUp', 'invalidPassword'),
        });
      }

      // Generate JWT token
      const jwtPayload = {
        userId: user.id,
        username: user.username,
        role: user.role,
      };
      const token = jwt.sign(jwtPayload, process.env.JWT_SECRET as string, {
        expiresIn: '7d',
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
        code: 'INTERNAL_SERVER_ERROR',
        message: getErrorMessage('authMessage', 'signUp', 'loginFailed'),
      });
    }
  }),
  verifyUser: publicProcedure
    .input(verifyUserSchema)
    .mutation(async ({ ctx: { db }, input }) => {
      const { username, otp, token } = input;
      // Find the OTP record
      const otpRecord = await db?.otp.findFirst({
        where: {
          identifier: username,
          otp,
          token,
          type: 'SIGNUP',
          used: false,
          expiresAt: { gte: new Date() },
        },
      });
      if (!otpRecord) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired OTP.',
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
            code: 'UNAUTHORIZED',
            message: 'Invalid credentials. Access denied.',
          });
        }

        // Check if user is active
        if (!user.active) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Account is not active. Please contact support.',
          });
        }

        // Verify password
        const isValid = await compare(password, user.password);
        if (!isValid) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid credentials. Access denied.',
          });
        }

        // Check if user has ADMIN role
        if (user.role !== 'ADMIN') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied. Super admin privileges required.',
          });
        }

        // Generate JWT token with admin privileges
        const jwtPayload = {
          userId: user.id,
          username: user.username,
          role: user.role,
        };
        const token = jwt.sign(jwtPayload, process.env.JWT_SECRET as string, {
          expiresIn: '24h', // Shorter expiration for admin tokens
        });

        return {
          token,
          username: user.username,
          userId: user.id,
          role: user.role,
          profile: user.Profile,
        };
      } catch (err: unknown) {
        console.error('Admin login error:', err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Login failed. Please try again.',
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
          code: 'UNAUTHORIZED',
          message: 'User not found.',
        });
      }

      if (!currentUser.active) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Account is not active.',
        });
      }

      // Check if user has ADMIN role
      if (currentUser.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied. Super admin privileges required.',
        });
      }

      return {
        username: currentUser.username,
        userId: currentUser.id,
        role: currentUser.role,
        profile: currentUser.Profile,
      };
    } catch (err: unknown) {
      console.error('Admin token validation error:', err);
      if (err instanceof TRPCError) {
        throw err;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Token validation failed.',
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
          code: 'UNAUTHORIZED',
          message: 'User not found.',
        });
      }

      if (!currentUser.active) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Account is not active.',
        });
      }

      // Check if user has STORE_ADMIN role
      if (currentUser.role !== 'STORE_ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied. Store admin privileges required.',
        });
      }

      return {
        username: currentUser.username,
        userId: currentUser.id,
        role: currentUser.role,
        profile: currentUser.Profile,
      };
    } catch (err: unknown) {
      console.error('Store admin token validation error:', err);
      if (err instanceof TRPCError) {
        throw err;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Token validation failed.',
      });
    }
  }),

  // Send OTP for login or signup
  sendOTP: publicProcedure
    .input(
      z.object({
        username: z.string(),
        type: z.enum(['LOGIN', 'SIGNUP', 'PASSWORD_RESET']),
      })
    )
    .mutation(async ({ ctx: { db }, input }) => {
      try {
        const { username, type } = input;

        // Check if user exists for LOGIN and PASSWORD_RESET
        if (type !== 'SIGNUP') {
          const user = await db?.user.findFirst({
            where: { username },
          });

          if (!user) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'User not found.',
            });
          }

          if (!user.active && type === 'LOGIN') {
            throw new TRPCError({
              code: 'UNAUTHORIZED',
              message:
                'Account is not active. Please verify your account first.',
            });
          }
        }

        const code = otpDigit();
        const token = generateSecureToken();
        const expiresAt = addMinutesToDate(3);

        // Find user for non-signup OTPs
        let userId: string | null = null;
        if (type !== 'SIGNUP') {
          const existingUser = await db?.user.findFirst({
            where: { username },
          });
          userId = existingUser?.id ?? null;
        }

        await db?.otp.create({
          data: {
            otp: code,
            token,
            type,
            identifier: username,
            expiresAt,
            userId,
          },
        });

        const queue = new OtpQueue();
        queue.addJob({
          otp: code,
          userId: userId || undefined,
          username,
          type,
        });

        return {
          success: true,
          message: 'OTP sent successfully',
          token,
        };
      } catch (err: unknown) {
        console.error(err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send OTP. Please try again.',
        });
      }
    }),

  // Login with OTP
  loginWithOTP: publicProcedure
    .input(loginWithOTPSchema)
    .mutation(async ({ ctx: { db }, input }) => {
      try {
        const { username, otp, token } = input;

        // Find the OTP record
        const otpRecord = await db?.otp.findFirst({
          where: {
            identifier: username,
            otp,
            token,
            type: 'LOGIN',
            used: false,
            expiresAt: { gte: new Date() },
          },
        });

        if (!otpRecord) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired OTP.',
          });
        }

        // Find the user
        const user = await db?.user.findUnique({
          where: { username },
          include: {
            Profile: true,
          },
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found.',
          });
        }

        if (!user.active) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Account is not active. Please verify your account first.',
          });
        }

        // Mark OTP as used
        await db?.otp.update({
          where: { id: otpRecord.id },
          data: { used: true },
        });

        // Generate JWT token
        const jwtPayload = {
          userId: user.id,
          username: user.username,
          role: user.role,
        };
        const jwtToken = jwt.sign(
          jwtPayload,
          process.env.JWT_SECRET as string,
          {
            expiresIn: '7d',
          }
        );

        return {
          token: jwtToken,
          username: user.username,
          userId: user.id,
          role: user.role,
          profile: user.Profile,
        };
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Login failed. Please try again.',
        });
      }
    }),

  // Verify OTP for password reset
  verifyPasswordResetOTP: publicProcedure
    .input(verifyPasswordResetOTPSchema)
    .mutation(async ({ ctx: { db }, input }) => {
      try {
        const { username, otp, token } = input;

        // Find the OTP record
        const otpRecord = await db?.otp.findFirst({
          where: {
            identifier: username,
            otp,
            token,
            type: 'PASSWORD_RESET',
            used: false,
            expiresAt: { gte: new Date() },
          },
        });

        if (!otpRecord) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'کد تایید نامعتبر یا منقضی شده است.',
          });
        }

        // Mark OTP as used
        await db?.otp.update({
          where: { id: otpRecord.id },
          data: { used: true },
        });

        // Generate a temporary reset token and store it in Redis
        const resetToken = generateSecureToken();
        const resetTokenExpiry = 15 * 60; // 15 minutes in seconds

        // Store reset token in Redis with user ID
        await redisConnection.setex(
          `password_reset:${resetToken}`,
          resetTokenExpiry,
          JSON.stringify({
            userId: otpRecord.userId,
            username: username,
            createdAt: new Date().toISOString(),
          })
        );

        return {
          success: true,
          resetToken,
        };
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'تایید کد ناموفق بود. لطفاً دوباره تلاش کنید.',
        });
      }
    }),

  // Reset password with reset token
  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ ctx: { db }, input }) => {
      try {
        const { resetToken, newPassword } = input;

        // Get reset token data from Redis
        const resetTokenData = await redisConnection.get(
          `password_reset:${resetToken}`
        );

        if (!resetTokenData) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'توکن نامعتبر یا منقضی شده است.',
          });
        }

        const { userId, username } = JSON.parse(resetTokenData);

        // Hash the new password
        const hashedPassword = await hash(
          newPassword,
          Number(process.env.PASSWORD_SALT)
        );

        // Update user password
        await db?.user.update({
          where: { id: userId },
          data: { password: hashedPassword },
        });

        // Delete the reset token from Redis
        await redisConnection.del(`password_reset:${resetToken}`);

        return {
          success: true,
          message: 'رمز عبور با موفقیت تغییر یافت.',
        };
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'تغییر رمز عبور ناموفق بود. لطفاً دوباره تلاش کنید.',
        });
      }
    }),
});
