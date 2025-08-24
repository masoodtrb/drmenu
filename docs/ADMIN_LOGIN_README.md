# Admin Login System

This document describes the super admin login system implemented for the drMenu application.

## Overview

The admin login system provides secure access to the super admin dashboard, allowing authorized administrators to manage the entire system.

## Features

- **Secure Authentication**: JWT-based authentication with role-based access control
- **Admin-Only Access**: Restricted to users with `ADMIN` role only
- **Modern UI**: Beautiful, responsive login interface with dark mode support
- **Session Management**: Automatic token storage and validation
- **Route Protection**: Protected admin routes with automatic redirects

## Routes

### Admin Login

- **URL**: `/admin/login`
- **Description**: Login page for super administrators
- **Access**: Public (but only admins can successfully authenticate)

### Admin Dashboard

- **URL**: `/admin/dashboard`
- **Description**: Main admin dashboard with management tools
- **Access**: Admin only (protected route)

### Admin Index

- **URL**: `/admin`
- **Description**: Redirects to login or dashboard based on authentication status
- **Access**: Public (redirects appropriately)

## API Endpoints

### Admin Login

- **Endpoint**: `POST /api/trpc/auth.adminLogin`
- **Input**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt_token",
    "username": "string",
    "userId": "string",
    "role": "ADMIN",
    "profile": "object"
  }
  ```

## Authentication Flow

1. **Login Request**: User submits credentials via the login form
2. **Validation**: System validates username/password and checks user role
3. **Token Generation**: JWT token is generated with 24-hour expiration
4. **Storage**: Token and user data are stored in localStorage
5. **Redirect**: User is redirected to the admin dashboard
6. **Route Protection**: All admin routes check for valid admin token

## Security Features

- **Role Verification**: Only users with `ADMIN` role can access admin features
- **Token Expiration**: Admin tokens expire after 24 hours (shorter than regular tokens)
- **Automatic Logout**: Invalid or expired tokens trigger automatic logout
- **Secure Storage**: Tokens are stored in localStorage (consider upgrading to httpOnly cookies for production)

## Default Admin Credentials

Based on the seed data, the following admin accounts are available:

- **Username**: `admin`
- **Password**: `Aa123456`

- **Username**: `superadmin`
- **Password**: `Aa123456`

## Usage

### For Developers

1. **Access Admin Login**: Navigate to `/admin/login`
2. **Enter Credentials**: Use admin username and password
3. **Access Dashboard**: After successful login, you'll be redirected to `/admin/dashboard`

### For Testing

You can test the admin login using the provided Postman collection:

1. Import the `postman_collection.json` file
2. Use the "Auth > Login" request with admin credentials
3. The response will automatically set the `adminToken` variable

## Components

### AdminProtected

A higher-order component that protects admin routes:

```tsx
import AdminProtected from "@/components/AdminProtected";

<AdminProtected>
  <YourAdminComponent />
</AdminProtected>;
```

### Admin Login Page

Located at `src/app/(admin)/login/page.tsx`, provides:

- Username/password form
- Error handling and validation
- Loading states
- Responsive design

### Admin Dashboard

Located at `src/app/(admin)/dashboard/page.tsx`, provides:

- Overview of system management tools
- Quick statistics
- Navigation to different admin functions

## File Structure

```
src/app/(admin)/
├── layout.tsx              # Admin layout wrapper
├── page.tsx                # Admin index (redirects)
├── login/
│   └── page.tsx           # Admin login page
└── dashboard/
    └── page.tsx           # Admin dashboard

src/components/
├── AdminProtected.tsx     # Route protection component
└── ui/
    └── alert.tsx          # Alert component for error messages

src/trpc/server/api/router/auth/
└── index.ts              # Contains adminLogin mutation
```

## Environment Variables

Ensure the following environment variables are set:

- `JWT_SECRET`: Secret key for JWT token generation
- `PASSWORD_SALT`: Salt rounds for password hashing

## Future Enhancements

- [ ] Implement httpOnly cookies for token storage
- [ ] Add two-factor authentication for admin accounts
- [ ] Implement admin activity logging
- [ ] Add password reset functionality for admin accounts
- [ ] Implement session management with Redis
- [ ] Add admin user management interface

## Troubleshooting

### Common Issues

1. **Login Fails**: Ensure the user has `ADMIN` role and is active
2. **Token Expired**: Admin tokens expire after 24 hours, re-login required
3. **Access Denied**: Verify user role is `ADMIN` in the database
4. **Redirect Loop**: Clear localStorage and try again

### Debug Steps

1. Check browser console for errors
2. Verify JWT_SECRET environment variable is set
3. Confirm user exists in database with correct role
4. Check if user account is active
