import { isEmail, isMobile } from './commonValidations';

// Test function to verify mobile and email validation
export function testMobileEmailValidation() {
  console.log('Testing mobile and email validation...');

  // Test mobile numbers
  const mobileTests = [
    '09123456789', // Should pass
    '+989123456789', // Should pass
    '989123456789', // Should pass
    '9123456789', // Should fail (missing 0 or +98)
    '08123456789', // Should fail (wrong prefix)
    '0912345678', // Should fail (too short)
    '091234567890', // Should fail (too long)
  ];

  // Test email addresses
  const emailTests = [
    'test@example.com', // Should pass
    'user.name@domain.co', // Should pass
    'invalid-email', // Should fail
    '@domain.com', // Should fail
    'user@', // Should fail
  ];

  console.log('\n=== Mobile Number Tests ===');
  mobileTests.forEach(mobile => {
    const result = isMobile(mobile);
    console.log(`${mobile}: ${result ? '✅ PASS' : '❌ FAIL'}`);
  });

  console.log('\n=== Email Tests ===');
  emailTests.forEach(email => {
    const result = isEmail(email);
    console.log(`${email}: ${result ? '✅ PASS' : '❌ FAIL'}`);
  });

  console.log('\nValidation tests completed!');
}

// Export for use in development
export default testMobileEmailValidation;
