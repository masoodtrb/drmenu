import { makeMessage } from "@/trpc/server/constants/messages";

export const authMessage = {
  signUp: {
    success: {},
    error: {
      existUser: "این شماره موبایل قبلا استفاده شده",
      createUser: "ایجاد کاربر با مشکل روبرو شده لطفا بعدا امتحان کنید.",
    },
  },
};
