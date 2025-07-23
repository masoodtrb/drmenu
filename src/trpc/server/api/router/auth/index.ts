import { createTRPCRouter, publicProcedure } from "@/trpc/server";
import { signUpSchema } from "./validation";
import { TRPCError } from "@trpc/server";
import { getErrorMessage } from "../../../constants/messages";
import { hash } from "bcrypt";
import { addMinutesToDate, otpDigit } from "@/trpc/server/helper/otp-generator";
import { OtpQueue } from "@/trpc/server/queue/otpQueue";

export const authRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ ctx: { db }, input }) => {
      try {
        const { password, username } = input;

        const existUser = db?.user.findFirst({
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

        const otp = await db?.otp.create({
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
      } catch (err: unknown) {
        throw err;
      }
    }),
});
