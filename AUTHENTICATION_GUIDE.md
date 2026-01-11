# Multi-Tenant Authentication Setup Guide

## 🏥 Overview

Your hospital management system now supports **multi-tenancy** with complete data isolation:
- Multiple hospitals can register independently
- Each hospital has its own users (email-based authentication)
- Each hospital's data is stored in a separate MongoDB database
- Complete data isolation between hospitals

## 🗂️ Database Structure

### Main Database (`doklink_main`)
Stores shared data:
- **hospitals** collection: All registered hospitals
- **users** collection: All users from all hospitals (with hospitalId reference)

### Hospital Databases (`doklink_hospital_{hospitalId}`)
Each hospital gets its own database containing:
- beds
- patients
- claims
- documents
- activities

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `bcryptjs` - Password hashing
- `next-auth` - Authentication
- All existing dependencies

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_SECRET=generate_a_random_secret_here
NEXTAUTH_URL=http://localhost:3000
```

**Generate NEXTAUTH_SECRET:**
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 3. MongoDB Setup

Your MongoDB will automatically organize data like this:

```
MongoDB Cluster
├── doklink_main (shared database)
│   ├── hospitals
│   └── users
├── doklink_hospital_<hospitalId1>
│   ├── beds
│   ├── patients
│   ├── claims
│   ├── documents
│   └── activities
├── doklink_hospital_<hospitalId2>
│   ├── beds
│   ├── patients
│   ├── claims
│   ├── documents
│   └── activities
└── ...
```

## 📝 User Flow

### Hospital Registration
1. Navigate to `/signup`
2. Fill in hospital details:
   - Hospital Name
   - Unique Hospital Code (e.g., "hosp_001")
   - Address, Phone, Email
3. Create admin account:
   - Name, Email, Password
   - This becomes the first user with Admin role

### User Login
1. Navigate to `/login`
2. Enter email and password
3. System automatically:
   - Validates credentials
   - Loads hospital context
   - Redirects to dashboard

### Admin Creating New Users
Admins can create additional users for their hospital:
```typescript
// Example API call from your frontend
await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Dr. Jane Smith',
    email: 'jane@hospital.com',
    password: 'secure_password',
    role: 'Doctor', // Admin | Doctor | Nurse | Staff
    phone: '+1-234-567-8900',
    department: 'Cardiology'
  })
});
```

## 🔐 Authentication Features

### Protected Routes
All routes except `/login` and `/signup` require authentication. The middleware automatically:
- Redirects unauthenticated users to login
- Injects hospital context into API requests

### Session Management
- Sessions last 30 days
- JWT-based (no database session storage)
- Hospital context stored in JWT token

### Authorization
- Role-based access control ready
- User roles: Admin, Doctor, Nurse, Staff
- Extend authorization in API routes as needed

## 🛠️ API Routes

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth handler (login)
- `POST /api/hospitals/register` - Register new hospital
- `GET /api/hospitals/register` - List all hospitals (public)

### User Management
- `GET /api/users` - Get all users in hospital (requires auth)
- `POST /api/users` - Create new user (Admin only)

### Hospital Data (All require authentication)
- `GET/POST /api/beds` - Hospital-specific beds
- `GET/POST /api/patients` - Hospital-specific patients
- `GET/POST /api/claims` - Hospital-specific claims
- `GET/POST /api/documents` - Hospital-specific documents
- `GET/POST /api/activities` - Hospital-specific activities

## 📱 Frontend Components

### Session Access
Use `useSession` hook to access user data:

```tsx
import { useSession } from 'next-auth/react';

export default function MyComponent() {
  const { data: session } = useSession();
  
  return (
    <div>
      <p>Hospital: {session?.user.hospitalName}</p>
      <p>User: {session?.user.name}</p>
      <p>Role: {session?.user.role}</p>
    </div>
  );
}
```

### Logout
```tsx
import { signOut } from 'next-auth/react';

<button onClick={() => signOut({ callbackUrl: '/login' })}>
  Logout
</button>
```

## 🏗️ Architecture Highlights

### Multi-Tenancy Strategy
- **Database-per-tenant**: Each hospital has isolated database
- **Shared authentication**: Centralized user management
- **Automatic routing**: Middleware injects hospital context

### Security Features
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with hospital context
- Server-side session validation
- SQL injection prevention (MongoDB)
- XSS protection (React)

### Data Isolation
- Hospital ID required in all data models
- API routes filter by session's hospitalId
- No cross-hospital data access possible
- Each hospital's database is completely separate

## 🎯 Usage Examples

### Example 1: Register First Hospital
```
1. Go to http://localhost:3000/signup
2. Hospital Name: "City General Hospital"
3. Hospital Code: "hosp_cgh"
4. Fill other details
5. Create admin account
6. Login and start adding beds/patients
```

### Example 2: Register Second Hospital
```
1. Go to http://localhost:3000/signup
2. Hospital Name: "Metro Medical Center"
3. Hospital Code: "hosp_mmc"
4. Create separate admin
5. Completely isolated from Hospital 1
```

### Example 3: Add Users to Hospital
```tsx
// Admin dashboard - Create User form
const handleCreateUser = async () => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Smith',
      email: 'smith@hospital.com',
      password: 'password123',
      role: 'Doctor',
      phone: '+1234567890',
      department: 'Emergency'
    })
  });
  
  if (response.ok) {
    alert('User created successfully!');
  }
};
```

## 🔄 Migration from Single-Tenant

If you had existing data, you'll need to:

1. **Backup existing data**
2. **Create a hospital** via signup
3. **Migrate data** to new hospital database:
   ```javascript
   // Migration script (run once)
   const oldDb = client.db('doklink');
   const newDb = client.db('doklink_hospital_<newHospitalId>');
   
   // Copy collections
   const beds = await oldDb.collection('beds').find().toArray();
   await newDb.collection('beds').insertMany(beds);
   // Repeat for other collections
   ```

## 🐛 Troubleshooting

### "MONGODB_URI missing"
- Ensure `.env.local` exists with valid MongoDB URI

### "NEXTAUTH_SECRET missing"
- Generate and add NEXTAUTH_SECRET to `.env.local`

### "Unauthorized" errors
- Check if user is logged in
- Verify JWT token is valid
- Clear browser cookies and re-login

### Hospital code already exists
- Each hospital needs unique code
- Use format: hosp_001, hosp_002, etc.

### Users can't see data
- Ensure hospitalId is correctly set
- Check MongoDB collections are in correct database
- Verify API routes use getHospitalDb()

## 📊 Testing

### Test Multi-Tenancy
1. Register Hospital A (code: hosp_a)
2. Login and create some beds/patients
3. Logout
4. Register Hospital B (code: hosp_b)
5. Login and verify you CANNOT see Hospital A's data
6. Create different beds/patients for Hospital B
7. Verify complete isolation

## 🚀 Running the Application

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

Navigate to `http://localhost:3000` and you'll be redirected to `/login`.

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review the code comments
3. Check MongoDB connection
4. Verify environment variables

---

**Your hospital management system is now enterprise-ready with complete multi-tenancy! 🎉**
