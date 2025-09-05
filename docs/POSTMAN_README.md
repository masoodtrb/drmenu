# drMenu API Testing with Postman

This document provides instructions for testing the drMenu API using the provided Postman collection.

## Setup Instructions

### 1. Import the Collection

1. Open Postman
2. Click "Import" button
3. Select the `postman_collection.json` file
4. The collection will be imported with all endpoints organized by category

### 2. Environment Variables

The collection uses the following variables:

- `baseUrl`: Set to `http://localhost:3000` (default)
- `authToken`: Automatically set after login
- `adminToken`: Automatically set for admin users
- `storeAdminToken`: Automatically set for store admin users

### 3. Authentication Flow

#### Step 1: Login

1. Use the "Auth > Login" request
2. Default credentials:
   - Username: `admin`
   - Password: `Aa123456`
3. The response will automatically set the appropriate token variables

#### Step 2: Test Protected Endpoints

After login, you can use any of the protected endpoints with the automatically set tokens.

## API Endpoints Overview

### Test Endpoints

- **Get Hello**: Simple test endpoint to verify API is working

### Authentication Endpoints

- **Sign Up**: Register a new user
- **Login**: Authenticate and get JWT token
- **Verify User**: Verify user with OTP (for signup verification)

### Profile Endpoints

- **Get My Profile**: Get current user's profile
- **Get Admin Profile**: Get admin profile (admin only)
- **Create Profile**: Create a new profile
- **Update Profile**: Update existing profile
- **Get Profile By User ID**: Get profile by user ID (admin only)
- **Delete Profile**: Delete profile (admin only)

### Store Endpoints

- **Create Store**: Create a new store (admin only)
- **Get Store By ID**: Get store by ID
- **List Stores**: List all stores with pagination and filters (admin only)
- **Update Store**: Update store details (admin only)
- **Delete Store**: Delete store (admin only)
- **Get Store Types**: Get all store types (admin only)
- **Get My Stores**: Get stores owned by current user (store admin)
- **Get My Store By ID**: Get specific store owned by current user (store admin)

### File Endpoints

- **Upload File**: Upload a file (base64 encoded)
- **List Files**: List files owned by current user

## Testing Workflow

### 1. Basic Setup

1. Start your development server: `npm run dev`
2. Import the Postman collection
3. Run the database seeder: `node src/database/seeds/index.mjs`

### 2. Authentication Testing

1. **Login as Admin**:
   - Use "Auth > Login" with admin credentials
   - This will set both `authToken` and `adminToken`

2. **Login as Store Admin**:
   - First create a store admin user using "Auth > Sign Up"
   - Then login with the new credentials
   - This will set `storeAdminToken`

### 3. Store Testing

1. **Get Store Types**: First get available store types
2. **Create Store**: Use a store type ID to create a new store
3. **List Stores**: Test pagination and filtering
4. **Update/Delete**: Test store management operations

### 4. Profile Testing

1. **Create Profile**: Create a profile for the logged-in user
2. **Update Profile**: Test profile updates
3. **Get Profile**: Verify profile data

### 5. File Testing

1. **Upload File**: Test file upload with base64 content
2. **List Files**: Verify file listing

## Request Body Format

All tRPC requests use this format:

```json
{
  "0": {
    "json": {
      // Your actual data here
    }
  }
}
```

## Example Requests

### Login Request

```json
{
  "0": {
    "json": {
      "username": "admin",
      "password": "Aa123456"
    }
  }
}
```

### Create Store Request

```json
{
  "0": {
    "json": {
      "title": "My New Store",
      "storeTypeId": "store_type_id_here",
      "active": true
    }
  }
}
```

### List Stores with Filters

```json
{
  "0": {
    "json": {
      "limit": 10,
      "offset": 0,
      "search": "restaurant",
      "active": true,
      "storeTypeId": "restaurant_type_id"
    }
  }
}
```

## Advanced Features

### Automatic Token Management

The collection includes a test script in the "Login" request that automatically:

- Sets `authToken` for general use
- Sets `adminToken` if user is admin
- Sets `storeAdminToken` if user is store admin

### Environment Variables

You can modify the `baseUrl` variable to test against different environments:

- Development: `http://localhost:3000`
- Staging: `https://staging.yourdomain.com`
- Production: `https://api.yourdomain.com`

### Error Handling

All endpoints include proper error handling and will return appropriate HTTP status codes and error messages.

## Troubleshooting

### Common Issues

1. **401 Unauthorized**:
   - Make sure you've logged in first
   - Check that the token is valid
   - Verify the Authorization header is set correctly

2. **404 Not Found**:
   - Verify the endpoint URL is correct
   - Check that the server is running on the correct port

3. **400 Bad Request**:
   - Verify the request body format is correct
   - Check that all required fields are provided
   - Ensure data types match the schema requirements

4. **403 Forbidden**:
   - Check user permissions/role
   - Verify you're using the correct token for the operation

### Debugging Tips

1. **Check Response Headers**: Look for authentication-related headers
2. **Verify Token**: Use a JWT decoder to check token contents
3. **Test Public Endpoints**: Start with public endpoints like "Get Hello"
4. **Check Server Logs**: Monitor your development server for errors

## Collection Structure

```
drMenu API Collection/
├── Test/
│   └── Get Hello
├── Auth/
│   ├── Sign Up
│   ├── Login
│   └── Verify User
├── Profile/
│   ├── Get My Profile
│   ├── Get Admin Profile
│   ├── Create Profile
│   ├── Update Profile
│   ├── Get Profile By User ID
│   └── Delete Profile
├── Store/
│   ├── Create Store
│   ├── Get Store By ID
│   ├── List Stores
│   ├── Update Store
│   ├── Delete Store
│   ├── Get Store Types
│   ├── Get My Stores
│   └── Get My Store By ID
└── File/
    ├── Upload File
    └── List Files
```

## Security Notes

- Never commit tokens to version control
- Use environment variables for sensitive data
- Test with different user roles to verify permissions
- Always test both positive and negative scenarios

## Support

If you encounter issues:

1. Check the server logs for detailed error messages
2. Verify the database connection and schema
3. Ensure all environment variables are set correctly
4. Test with the provided sample data from the seeder
