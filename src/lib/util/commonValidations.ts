import * as z from 'zod';

export const emailValidation = z.email();

export const isEmail = (mail: string) => {
  const parsed = emailValidation.safeParse(mail);
  return parsed.success;
};

const iranMobileREGX = new RegExp('^(\\+98|0)?9\\d{9}$');

export const mobileValidation = z.string().regex(iranMobileREGX);

export const isMobile = (mobile: string) => {
  const parsed = mobileValidation.safeParse(mobile);

  return parsed.success;
};
