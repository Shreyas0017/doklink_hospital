# 🚀 Quick Start - Multi-Tenant Authentication

## Install & Setup (2 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local file
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_generated_secret
NEXTAUTH_URL=http://localhost:3000

# 3. Run the app
npm run dev
```

## First Time Use

### 1️⃣ Register Your Hospital (http://localhost:3000/signup)
- Hospital Name: "Your Hospital Name"
- Hospital Code: "hosp_yourcode" (unique identifier)
- Fill address, phone, email
- Create admin account with email/password

### 2️⃣ Login (http://localhost:3000/login)
- Use the admin email and password you just created
- You'll see your hospital name in the sidebar

### 3️⃣ Start Using
- Add beds, patients, claims as before
- Your data is isolated from other hospitals
- Admins can create more users via /api/users

## Key Concepts

**Multi-Tenancy**: Multiple hospitals, completely isolated data

**Database Structure**:
- `doklink_main` → hospitals + users (shared)
- `doklink_hospital_{id}` → each hospital's data (isolated)

**User Roles**: Admin | Doctor | Nurse | Staff

**Session**: Automatically includes hospital context

## Common Tasks

### Create New User (Admin Only)
```typescript
fetch('/api/users', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Dr. John',
    email: 'john@hospital.com',
    password: 'secure123',
    role: 'Doctor'
  })
});
```

### Get Current User Info
```tsx
import { useSession } from 'next-auth/react';

const { data: session } = useSession();
// session.user.hospitalName
// session.user.name
// session.user.role
```

### Logout
```tsx
import { signOut } from 'next-auth/react';
signOut({ callbackUrl: '/login' });
```

## Files Created/Modified

### New Files:
- `app/api/auth/[...nextauth]/route.ts` - Auth handler
- `app/api/hospitals/register/route.ts` - Hospital registration
- `app/api/users/route.ts` - User management
- `app/login/page.tsx` - Login page
- `app/signup/page.tsx` - Signup page
- `middleware.ts` - Route protection
- `types/next-auth.d.ts` - TypeScript types
- `components/AuthProvider.tsx` - Session provider

### Modified Files:
- `lib/types.ts` - Added Hospital & User types, hospitalId to all models
- `lib/mongodb.ts` - Added getHospitalDb() function
- `app/layout.tsx` - Added AuthProvider
- `components/Sidebar.tsx` - Added hospital info & logout
- `app/api/beds/route.ts` - Multi-tenant support
- `app/api/patients/route.ts` - Multi-tenant support
- `app/api/claims/route.ts` - Multi-tenant support
- `app/api/documents/route.ts` - Multi-tenant support
- `app/api/activities/route.ts` - Multi-tenant support
- `package.json` - Added bcryptjs

## Troubleshooting

**Can't login?** 
- Check MongoDB connection
- Verify NEXTAUTH_SECRET is set
- Clear browser cookies

**Data not showing?**
- Ensure you're logged in
- Check browser console for errors
- Verify MongoDB has the hospital database

**Hospital code exists?**
- Each hospital needs unique code
- Try different code like "hosp_002"

---
✅ You're all set! Start by registering your first hospital at `/signup`
