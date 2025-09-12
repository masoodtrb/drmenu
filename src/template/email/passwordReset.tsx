import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Section,
  Text,
} from '@react-email/components';

interface PasswordResetEmailProps {
  validationCode?: string;
  username?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const PasswordResetEmail = ({
  validationCode,
  username,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Img
          src={`${baseUrl}/mail-logo.png`}
          width="212"
          height="88"
          alt="Dr Menu"
          style={logo}
        />
        <Text style={tertiary}>بازیابی رمز عبور</Text>
        <Heading style={secondary}>کد تایید برای تغییر رمز عبور</Heading>
        <Text style={paragraph}>سلام {username}،</Text>
        <Text style={paragraph}>
          درخواست تغییر رمز عبور برای حساب کاربری شما دریافت شده است. برای
          ادامه، کد تایید زیر را وارد کنید:
        </Text>
        <Section style={codeContainer}>
          <Text style={code}>{validationCode}</Text>
        </Section>
        <Text style={paragraph}>این کد تا ۳ دقیقه معتبر است.</Text>
        <Text style={paragraph}>
          اگر شما این درخواست را نداده‌اید، لطفاً این ایمیل را نادیده بگیرید.
        </Text>
        <Text style={paragraph}>
          برای پشتیبانی با{' '}
          <Link href="mailto:support@drmenu.com" style={link}>
            support@drmenu.com
          </Link>{' '}
          تماس بگیرید.
        </Text>
      </Container>
      <Text style={footer}>Dr Menu - سیستم مدیریت منو</Text>
    </Body>
  </Html>
);

PasswordResetEmail.PreviewProps = {
  validationCode: '123456',
  username: 'کاربر',
} as PasswordResetEmailProps;

export default PasswordResetEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  direction: 'rtl' as const,
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #eee',
  borderRadius: '5px',
  boxShadow: '0 5px 10px rgba(20,50,70,.2)',
  marginTop: '20px',
  maxWidth: '360px',
  margin: '0 auto',
  padding: '68px 0 130px',
};

const logo = {
  margin: '0 auto',
};

const tertiary = {
  color: '#10b981',
  fontSize: '11px',
  fontWeight: 700,
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  height: '16px',
  letterSpacing: '0',
  lineHeight: '16px',
  margin: '16px 8px 8px 8px',
  textTransform: 'uppercase' as const,
  textAlign: 'center' as const,
};

const secondary = {
  color: '#000',
  display: 'inline-block',
  fontFamily: 'HelveticaNeue-Medium,Helvetica,Arial,sans-serif',
  fontSize: '20px',
  fontWeight: 500,
  lineHeight: '24px',
  marginBottom: '0',
  marginTop: '0',
  textAlign: 'center' as const,
};

const codeContainer = {
  background: 'rgba(16, 185, 129, 0.1)',
  borderRadius: '4px',
  margin: '16px auto 14px',
  verticalAlign: 'middle',
  width: '280px',
  border: '2px solid #10b981',
};

const code = {
  color: '#10b981',
  fontFamily: 'HelveticaNeue-Bold',
  fontSize: '32px',
  fontWeight: 700,
  letterSpacing: '6px',
  lineHeight: '40px',
  paddingBottom: '8px',
  paddingTop: '8px',
  margin: '0 auto',
  display: 'block',
  textAlign: 'center' as const,
};

const paragraph = {
  color: '#444',
  fontSize: '15px',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  letterSpacing: '0',
  lineHeight: '23px',
  padding: '0 40px',
  margin: '0',
  textAlign: 'center' as const,
};

const link = {
  color: '#10b981',
  textDecoration: 'underline',
};

const footer = {
  color: '#000',
  fontSize: '12px',
  fontWeight: 800,
  letterSpacing: '0',
  lineHeight: '23px',
  margin: '0',
  marginTop: '20px',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  textAlign: 'center' as const,
  textTransform: 'uppercase' as const,
};
