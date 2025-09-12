import * as z from 'zod';

export const loginSchema = z.object({
  username: z.string(),
  password: z.string().min(8),
});

export const signUpSchema = loginSchema.extend({});

export const verifyUserSchema = z.object({
  username: z.string(),
  otp: z.string(),
  token: z.string(),
});

export const loginWithOTPSchema = z.object({
  username: z.string(),
  otp: z.string(),
  token: z.string(),
});

export const verifyPasswordResetOTPSchema = z.object({
  username: z.string(),
  otp: z.string(),
  token: z.string(),
});

export const resetPasswordSchema = z.object({
  resetToken: z.string(),
  newPassword: z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
});

export type ILogin = z.infer<typeof loginSchema>;
export type ISignUp = z.infer<typeof signUpSchema>;
export type IVerifyUser = z.infer<typeof verifyUserSchema>;
export type ILoginWithOTP = z.infer<typeof loginWithOTPSchema>;
export type IVerifyPasswordResetOTP = z.infer<
  typeof verifyPasswordResetOTPSchema
>;
export type IResetPassword = z.infer<typeof resetPasswordSchema>;
