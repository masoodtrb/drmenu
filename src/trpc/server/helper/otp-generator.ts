import * as crypto from "crypto";

const digits = "0123456789";
const lowerCaseAlphabets = "abcdefghijklmnopqrstuvwxyz";
const upperCaseAlphabets = lowerCaseAlphabets.toUpperCase();
const specialChars = "#!&@";

export interface GenerateOptions {
  digits?: boolean; // Include digits
  lowerCaseAlphabets?: boolean; // Include lowercase alphabets
  upperCaseAlphabets?: boolean; // Include uppercase alphabets
  specialChars?: boolean; // Include special characters
}

/**
 * Generates an OTP or password string based on length and provided options.
 * @param length - Desired length of the OTP. Defaults to 10.
 * @param options - Customization options for character selection.
 * @returns A secure, randomly generated OTP.
 */
export function otpGenerator(
  length: number = 10,
  options: GenerateOptions = {}
): string {
  const {
    digits: includeDigits = true,
    lowerCaseAlphabets: includeLowerCase = true,
    upperCaseAlphabets: includeUpperCase = true,
    specialChars: includeSpecialChars = true,
  } = options;

  const allowedChars =
    (includeDigits ? digits : "") +
    (includeLowerCase ? lowerCaseAlphabets : "") +
    (includeUpperCase ? upperCaseAlphabets : "") +
    (includeSpecialChars ? specialChars : "");

  if (!allowedChars) {
    throw new Error(
      "No characters available to generate OTP. Please adjust the options."
    );
  }

  let password = "";
  while (password.length < length) {
    const charIndex = crypto.randomInt(0, allowedChars.length);
    // Prevent OTP from starting with '0' if digits are included
    if (
      password.length === 0 &&
      includeDigits &&
      allowedChars[charIndex] === "0"
    ) {
      continue;
    }
    password += allowedChars[charIndex];
  }
  return password;
}

/**
 * Utility function to add a specific number of minutes to a date.
 * @param minutes - Minutes to add.
 * @param date - The base date.
 * @returns A new Date instance with the added minutes.
 */
export function addMinutesToDate(
  minutes: number,
  date: Date = new Date()
): Date {
  return new Date(date.getTime() + minutes * 60000);
}

export const otpDigit = () =>
  otpGenerator(5, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
