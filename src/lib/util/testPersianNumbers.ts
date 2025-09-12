import {
  validateEmailWithPersian,
  validateMobileWithPersian,
} from './commonValidations';
import {
  containsPersianNumbers,
  convertEnglishToPersian,
  convertPersianToEnglish,
  normalizePhoneNumber,
  testPersianNumberConversion,
} from './persianNumberConverter';

// Test function for Persian number conversion in authentication context
export function testPersianNumberAuth() {
  console.log('🧪 Testing Persian number conversion for authentication...');

  const testCases = [
    // Mobile numbers in Persian
    '۰۹۱۲۳۴۵۶۷۸۹',
    '۰۹۱۲-۳۴۵-۶۷۸۹',
    '+۹۸۹۱۲۳۴۵۶۷۸۹',
    '۹۸۹۱۲۳۴۵۶۷۸۹',

    // Mobile numbers in English
    '09123456789',
    '0912-345-6789',
    '+989123456789',
    '989123456789',

    // Mixed cases
    '۰۹۱۲۳۴۵۶۷۸۹', // Persian
    '09123456789', // English

    // Invalid cases
    '۰۸۱۲۳۴۵۶۷۸۹', // Wrong prefix
    '۰۹۱۲۳۴۵۶۷۸', // Too short
    '۰۹۱۲۳۴۵۶۷۸۹۰', // Too long
  ];

  console.log('\n=== Mobile Number Validation Tests ===');
  testCases.forEach(testCase => {
    const mobileValidation = validateMobileWithPersian(testCase);
    console.log(`Input: ${testCase}`);
    console.log(`  Valid: ${mobileValidation.isValid ? '✅' : '❌'}`);
    console.log(`  Normalized: ${mobileValidation.normalized}`);
    console.log(
      `  Was Converted: ${mobileValidation.wasConverted ? '🔄' : '➡️'}`
    );
    console.log('---');
  });

  // Test email with Persian numbers (edge case)
  const emailTests = [
    'user@example.com',
    'user۱۲۳@example.com', // Persian numbers in email
    'user123@example.com', // English numbers in email
  ];

  console.log('\n=== Email Validation Tests ===');
  emailTests.forEach(testCase => {
    const emailValidation = validateEmailWithPersian(testCase);
    console.log(`Input: ${testCase}`);
    console.log(`  Valid: ${emailValidation.isValid ? '✅' : '❌'}`);
    console.log(`  Normalized: ${emailValidation.normalized}`);
    console.log(
      `  Was Converted: ${emailValidation.wasConverted ? '🔄' : '➡️'}`
    );
    console.log('---');
  });

  console.log('\n🎉 Persian number authentication tests completed!');
}

// Test function for SMS sending with Persian numbers
export function testSmsWithPersianNumbers() {
  console.log('📱 Testing SMS sending with Persian numbers...');

  const testMobiles = [
    '۰۹۱۲۳۴۵۶۷۸۹', // Persian
    '09123456789', // English
    '+۹۸۹۱۲۳۴۵۶۷۸۹', // Persian with country code
    '+989123456789', // English with country code
  ];

  testMobiles.forEach(mobile => {
    const normalized = normalizePhoneNumber(mobile);
    const containsPersian = containsPersianNumbers(mobile);

    console.log(`Original: ${mobile}`);
    console.log(`Normalized: ${normalized}`);
    console.log(`Contains Persian: ${containsPersian ? '✅' : '❌'}`);
    console.log('---');
  });

  console.log('📱 SMS Persian number tests completed!');
}

// Run all tests
export function runAllPersianNumberTests() {
  console.log('🚀 Running all Persian number tests...\n');

  testPersianNumberConversion();
  console.log('\n' + '='.repeat(50) + '\n');

  testPersianNumberAuth();
  console.log('\n' + '='.repeat(50) + '\n');

  testSmsWithPersianNumbers();

  console.log('\n🎉 All Persian number tests completed!');
}

// Export for use in development
export default {
  testPersianNumberAuth,
  testSmsWithPersianNumbers,
  runAllPersianNumberTests,
};
