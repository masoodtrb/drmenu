import { makeMessage } from '@/trpc/server/constants/messages';

export const authMessage = {
  signUp: {
    success: {},
    error: {
      existUser: 'این شماره موبایل قبلا استفاده شده',
      createUser: 'ایجاد کاربر با مشکل روبرو شده لطفا بعدا امتحان کنید.',
      userNotFound: 'کاربری با این مشخصات یافت نشد.',
      invalidPassword: 'رمز عبور اشتباه است.',
      loginFailed: 'ورود با مشکل مواجه شد. لطفا دوباره تلاش کنید.',
    },
  },
};
