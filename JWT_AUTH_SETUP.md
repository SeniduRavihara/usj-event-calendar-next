# JWT Authentication Setup

This document explains the JWT authentication system implemented in the USJ Event Calendar application.

## Features

- **JWT Token Authentication**: Secure token-based authentication with 7-day expiration
- **Role-based Access Control**: Different access levels for ADMIN and STUDENT users
- **Protected Routes**: Automatic route protection with middleware
- **Context-based State Management**: React context for user state management
- **HTTP-only Cookies**: Secure token storage in HTTP-only cookies
- **Automatic Redirects**: Smart redirects based on user role and authentication status

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/usj_event_calendar"

# JWT Secret (generate a strong secret for production)
JWT_SECRET="your-super-secret-jwt-key-here"

# Next.js
NODE_ENV="development"
```

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user information

### Request/Response Examples

#### Login Request

```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login Response

```json
{
  "message": "Login success",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "STUDENT",
    "department": "Computer Science",
    "student_id": "2024/CS/001",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Components

### AuthContext

Provides authentication state and methods throughout the application:

- `user`: Current user object or null
- `loading`: Loading state for authentication
- `login(email, password)`: Login function
- `logout()`: Logout function
- `refreshUser()`: Refresh user data

### ProtectedRoute

Wrapper component for protecting routes:

- `requiredRole`: Optional role requirement (ADMIN or STUDENT)
- `redirectTo`: Custom redirect URL for unauthorized access

## Usage Examples

### Using AuthContext in Components

```tsx
import { useAuth } from "../components/AuthContext";

function MyComponent() {
  const { user, login, logout, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => login("email", "password")}>Login</button>
      )}
    </div>
  );
}
```

### Protecting Routes

```tsx
import { ProtectedRoute } from "../components/ProtectedRoute";

function AdminPage() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div>Admin content here</div>
    </ProtectedRoute>
  );
}
```

## Security Features

1. **JWT Tokens**: Secure, stateless authentication tokens
2. **HTTP-only Cookies**: Prevents XSS attacks by storing tokens in HTTP-only cookies
3. **Role-based Access**: Different access levels for different user types
4. **Middleware Protection**: Server-side route protection
5. **Token Expiration**: 7-day token expiration for security
6. **Password Hashing**: bcrypt for secure password storage

## File Structure

```
src/
├── app/
│   ├── api/auth/
│   │   ├── login/route.ts
│   │   ├── logout/route.ts
│   │   └── me/route.ts
│   ├── lib/
│   │   └── auth.ts
│   └── middleware.ts
├── components/
│   ├── AuthContext.tsx
│   └── ProtectedRoute.tsx
└── ...
```

## Testing the Authentication

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Click "Sign Up" to create a new account
4. Click "Sign In" to login with your credentials
5. You should be redirected to the appropriate dashboard based on your role

## Troubleshooting

### Common Issues

1. **JWT_SECRET not set**: Make sure to set the JWT_SECRET environment variable
2. **Database connection issues**: Verify your DATABASE_URL is correct
3. **Token expiration**: Tokens expire after 7 days, users need to login again
4. **Role-based access**: Make sure users have the correct role for protected routes

### Debug Mode

To debug authentication issues, check the browser's Network tab and Application tab (for cookies) in the developer tools.

