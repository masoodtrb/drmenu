/**
 * Utility functions for converting Persian/Farsi numbers to English numbers
 * This is essential for Iranian users who might input numbers in Persian format
 */

// Persian/Farsi digits mapping
const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const ENGLISH_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Convert Persian/Farsi numbers to English numbers
 * @param text - Input text that may contain Persian numbers
 * @returns Text with all Persian numbers converted to English
 */
export function convertPersianToEnglish(text: string): string {
  if (!text) return text;

  let result = text;

  // Convert Persian digits to English
  PERSIAN_DIGITS.forEach((persianDigit, index) => {
    result = result.replace(
      new RegExp(persianDigit, 'g'),
      ENGLISH_DIGITS[index]
    );
  });

  // Convert Arabic digits to English
  ARABIC_DIGITS.forEach((arabicDigit, index) => {
    result = result.replace(
      new RegExp(arabicDigit, 'g'),
      ENGLISH_DIGITS[index]
    );
  });

  return result;
}

/**
 * Convert English numbers to Persian/Farsi numbers
 * @param text - Input text that may contain English numbers
 * @returns Text with all English numbers converted to Persian
 */
export function convertEnglishToPersian(text: string): string {
  if (!text) return text;

  let result = text;

  // Convert English digits to Persian
  ENGLISH_DIGITS.forEach((englishDigit, index) => {
    result = result.replace(
      new RegExp(englishDigit, 'g'),
      PERSIAN_DIGITS[index]
    );
  });

  return result;
}

/**
 * Check if a string contains Persian or Arabic numbers
 * @param text - Input text to check
 * @returns True if the text contains Persian or Arabic numbers
 */
export function containsPersianNumbers(text: string): boolean {
  if (!text) return false;

  const persianRegex = /[۰-۹]/;
  const arabicRegex = /[٠-٩]/;

  return persianRegex.test(text) || arabicRegex.test(text);
}

/**
 * Normalize phone number by converting Persian numbers and cleaning format
 * @param phoneNumber - Phone number that may contain Persian numbers
 * @returns Normalized phone number in English digits
 */
export function normalizePhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return phoneNumber;

  // Convert Persian/Arabic numbers to English
  let normalized = convertPersianToEnglish(phoneNumber);

  // Remove any non-digit characters except + at the beginning
  normalized = normalized.replace(/[^\d+]/g, '');

  // Ensure + is only at the beginning
  if (normalized.includes('+')) {
    normalized = '+' + normalized.replace(/\+/g, '');
  }

  return normalized;
}

/**
 * Test function to verify Persian number conversion
 */
export function testPersianNumberConversion() {
  console.log('Testing Persian number conversion...');

  const testCases = [
    '۰۹۱۲۳۴۵۶۷۸۹', // Persian mobile
    '۰۹۱۲-۳۴۵-۶۷۸۹', // Persian mobile with dashes
    '+۹۸۹۱۲۳۴۵۶۷۸۹', // Persian mobile with country code
    'test@example.com', // Email (no numbers)
    '۰۱۲۳۴۵۶۷۸۹', // Persian landline
    '۰۲۱-۱۲۳۴۵۶۷۸', // Persian landline with area code
  ];

  console.log('\n=== Persian to English Conversion ===');
  testCases.forEach(testCase => {
    const converted = convertPersianToEnglish(testCase);
    const normalized = normalizePhoneNumber(testCase);
    console.log(`Original: ${testCase}`);
    console.log(`Converted: ${converted}`);
    console.log(`Normalized: ${normalized}`);
    console.log(`Contains Persian: ${containsPersianNumbers(testCase)}`);
    console.log('---');
  });

  console.log('\n=== English to Persian Conversion ===');
  const englishTests = ['09123456789', '+989123456789', '02112345678'];
  englishTests.forEach(testCase => {
    const converted = convertEnglishToPersian(testCase);
    console.log(`English: ${testCase} -> Persian: ${converted}`);
  });

  console.log('\nPersian number conversion tests completed!');
}

// Export default for convenience
export default {
  convertPersianToEnglish,
  convertEnglishToPersian,
  containsPersianNumbers,
  normalizePhoneNumber,
  testPersianNumberConversion,
};
