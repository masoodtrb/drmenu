# Store Authentication System

This document describes the store authentication system implemented for the Dr.Menu application.

## Overview

The store authentication system provides a complete signup, signin, and OTP verification flow for store administrators. It includes:

- **Signup Page**: New store admin registration with email/mobile verification
- **Signin Page**: Login for existing store admins
- **OTP Verification**: Email/SMS verification for account activation and login
- **Dashboard**: Protected dashboard for authenticated store admins

## Pages Structure

```
src/app/store/
├── page.tsx              # Index page (redirects to signin/dashboard)
├── signup/
│   └── page.tsx          # Store registration page
├── signin/
│   └── page.tsx          # Store login page
├── otp/
│   └── page.tsx          # OTP verification page
└── dashboard/
    └── page.tsx          # Protected dashboard page
```

## Authentication Flow

### 1. Signup Flow

1. User visits `/store/signup`
2. Enters email/mobile and password
3. System creates inactive user account
4. OTP is sent to email/mobile
5. User is redirected to `/store/otp?username=xxx&type=signup`
6. User enters OTP code
7. Account is activated and user is redirected to signin

### 2. Signin Flow

1. User visits `/store/signin`
2. Enters email/mobile and password
3. System validates credentials
4. User is redirected to `/store/dashboard`

### 3. OTP Login Flow

1. User clicks "ورود با کد تایید" on signin page
2. User is redirected to `/store/otp?type=login`
3. User enters email/mobile
4. OTP is sent to email/mobile
5. User enters OTP code
6. User is logged in and redirected to dashboard

## API Endpoints

### Authentication Endpoints

- `POST /api/trpc/auth.signUp` - Register new store admin
- `POST /api/trpc/auth.login` - Login with password
- `POST /api/trpc/auth.verifyUser` - Verify OTP for signup
- `POST /api/trpc/auth.loginWithOTP` - Login with OTP
- `POST /api/trpc/auth.sendOTP` - Send OTP for login/signup

### Protected Endpoints

- `GET /api/trpc/auth.validateStoreAdminToken` - Validate store admin token

## Components

### StoreProtected

A wrapper component that protects store admin routes:

- Checks if user is authenticated
- Validates STORE_ADMIN role
- Redirects to signin if not authorized

### User Store (Zustand)

Manages store admin authentication state:

- `storeUser`: Current store admin user data
- `storeToken`: JWT token for store admin
- `setStoreUser()`: Set store admin user and token
- `logoutStore()`: Clear store admin session

## Features

### Security

- JWT-based authentication
- Password hashing with bcrypt
- OTP verification for account activation
- Role-based access control (STORE_ADMIN)
- Protected routes with automatic redirects

### User Experience

- Modern, responsive UI with Tailwind CSS
- Persian (Farsi) language support
- Dark mode support
- Loading states and error handling
- Auto-focus OTP input fields
- Resend OTP functionality with countdown

### OTP System

- 5-digit numeric codes using shadcn/ui Input OTP component
- 3-minute expiration
- Email delivery via React Email
- SMS support (TODO: implement)
- Rate limiting and attempt tracking
- Copy-paste functionality
- Auto-focus and navigation

## Styling

The store authentication pages use a green/emerald color scheme to differentiate from the admin blue theme:

- **Primary Colors**: Green-500 to Emerald-600 gradients
- **Background**: Green-50 to Emerald-100 gradients
- **Dark Mode**: Slate-900 to Slate-800 backgrounds
- **Icons**: Store icon for branding

## Usage Examples

### Basic Signup

```typescript
const signupMutation = trpc.auth.signUp.useMutation({
  onSuccess: data => {
    router.push(`/store/otp?username=${data.username}&type=signup`);
  },
  onError: error => {
    setError(error.message);
  },
});
```

### Protected Route

```typescript
import StoreProtected from '@/components/StoreProtected';

export default function MyProtectedPage() {
  return (
    <StoreProtected>
      <div>Protected content here</div>
    </StoreProtected>
  );
}
```

### User Store Usage

```typescript
import { useUserStore } from '@/lib/store/userStore';

const { storeUser, storeToken, setStoreUser, logoutStore } = useUserStore();
```

## Environment Variables

Make sure these environment variables are set:

- `JWT_SECRET`: Secret key for JWT tokens
- `PASSWORD_SALT`: Salt rounds for password hashing
- Email configuration for OTP delivery

## Future Enhancements

- [ ] SMS OTP delivery
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Session management
- [ ] Account lockout after failed attempts
- [ ] Email verification resend
- [ ] Profile management
- [ ] Store creation flow
