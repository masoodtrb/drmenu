import * as z from "zod";

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

export type ILogin = z.infer<typeof loginSchema>;
export type ISignUp = z.infer<typeof signUpSchema>;
export type IVerifyUser = z.infer<typeof verifyUserSchema>;
export type ILoginWithOTP = z.infer<typeof loginWithOTPSchema>;
