import * as z from 'zod';

import {
  convertPersianToEnglish,
  normalizePhoneNumber,
} from './persianNumberConverter';

export const emailValidation = z.email();

export const isEmail = (mail: string) => {
  const parsed = emailValidation.safeParse(mail);
  return parsed.success;
};

const iranMobileREGX = new RegExp('^(\\+98|0)?9\\d{9}$');

export const mobileValidation = z.string().regex(iranMobileREGX);

export const isMobile = (mobile: string) => {
  // Convert Persian numbers to English before validation
  const normalizedMobile = normalizePhoneNumber(mobile);
  const parsed = mobileValidation.safeParse(normalizedMobile);
  return parsed.success;
};

// Enhanced validation that handles Persian numbers
export const validateMobileWithPersian = (mobile: string) => {
  const normalizedMobile = normalizePhoneNumber(mobile);
  return {
    isValid: isMobile(normalizedMobile),
    normalized: normalizedMobile,
    original: mobile,
    wasConverted: mobile !== normalizedMobile,
  };
};

// Enhanced validation that handles Persian numbers for email
export const validateEmailWithPersian = (email: string) => {
  const normalizedEmail = convertPersianToEnglish(email);
  return {
    isValid: isEmail(normalizedEmail),
    normalized: normalizedEmail,
    original: email,
    wasConverted: email !== normalizedEmail,
  };
};

// Profile completion validation
export interface ProfileCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
}

export const validateProfileCompletion = (profile: {
  firstName?: string | null;
  lastName?: string | null;
  nationalId?: string | null;
}): ProfileCompletionStatus => {
  const requiredFields = [
    { key: 'firstName', label: 'نام' },
    { key: 'lastName', label: 'نام خانوادگی' },
    { key: 'nationalId', label: 'کد ملی' },
  ];

  const missingFields: string[] = [];

  requiredFields.forEach(field => {
    const value = profile[field.key as keyof typeof profile];
    if (!value || value.trim() === '') {
      missingFields.push(field.label);
    }
  });

  const completionPercentage = Math.round(
    ((requiredFields.length - missingFields.length) / requiredFields.length) *
      100
  );

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage,
  };
};
