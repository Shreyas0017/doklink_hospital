# 🏥 DokLink - Multi-Tenant Hospital Management System

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://www.mongodb.com/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4.24-purple)](https://next-auth.js.org/)

A modern, secure, and scalable hospital management system with **multi-tenant architecture**. Each hospital gets its own isolated database with complete data privacy.

## ✨ Key Features

### 🔐 Enterprise-Grade Authentication
- **Multi-Tenant Architecture** - Unlimited hospitals, completely isolated
- **Secure Password Hashing** - bcrypt with salt rounds
- **JWT-Based Sessions** - Stateless, scalable authentication
- **Role-Based Access Control** - Admin, Doctor, Nurse, Staff roles
- **Protected Routes** - Automatic authentication middleware

### 🏥 Hospital Management
- **Independent Hospitals** - Each with unique code and database
- **User Management** - Create and manage hospital staff
- **Complete Data Isolation** - No cross-hospital data access
- **Hospital Profiles** - Name, address, contact information

### 🛏️ Core Features
- **Bed Management** - Track availability, assignments, maintenance
- **Patient Records** - Comprehensive patient information
- **Insurance Claims** - Manage and track claim processing
- **Medical Documents** - Store and organize patient documents
- **Activity Logging** - Track all system activities

### 🎨 Modern UI/UX
- **Beautiful Design** - Gradient-based, modern interface
- **Dark Mode Support** - System theme integration
- **Responsive Layout** - Mobile, tablet, desktop optimized
- **Real-time Updates** - Instant data synchronization
- **Collapsible Sidebar** - Maximize workspace

## 🏗️ Architecture

### Database Structure
```
MongoDB Cluster
├── doklink_main (shared)
│   ├── hospitals → All registered hospitals
│   └── users → All users with hospital references
│
└── doklink_hospital_{id} (per hospital)
    ├── beds
    ├── patients
    ├── claims
    ├── documents
    └── activities
```

### Security Layers
1. **Middleware** - Route protection and JWT validation
2. **API Layer** - Session verification and role checks
3. **Database** - Complete isolation per hospital
4. **Password** - Bcrypt hashing with secure comparison

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Shreyas0017/doklink_hospital.git
cd doklink_hospital
npm install
```

### 2. Environment Setup
Create `.env.local`:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
```

Generate secret:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 3. Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

### 4. Register Your First Hospital
1. Click "Register Hospital" on login page
2. Fill hospital details (name, code, address)
3. Create admin account (email, password)
4. Login and start managing!

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) | Complete environment setup guide |
| [QUICK_START_AUTH.md](QUICK_START_AUTH.md) | Quick reference for authentication |
| [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) | Comprehensive auth documentation |
| [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md) | System architecture and flow |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | What was implemented |

## 🔑 Key Concepts

### Multi-Tenancy
- Each hospital = separate database
- Users belong to one hospital
- Complete data isolation
- Scalable to unlimited hospitals

### Authentication Flow
```
User Login → Validate Credentials → Create JWT Session
    → Store Hospital Context → Access Protected Routes
    → Automatic Hospital Filtering
```

### API Routes
All authenticated routes automatically filter by hospital:

```typescript
// Example: Fetching beds
const session = await getServerSession();
const db = await getHospitalDb(session.user.hospitalId);
const beds = await db.collection("beds").find({}).toArray();
// Returns only this hospital's beds
```

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **NextAuth.js** | Authentication & session management |
| **MongoDB** | NoSQL database with multi-tenancy |
| **Tailwind CSS** | Utility-first styling |
| **Lucide React** | Beautiful icons |
| **bcryptjs** | Password hashing |

## 📁 Project Structure

```
doklink_hospital/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # NextAuth handler
│   │   ├── hospitals/         # Hospital registration
│   │   ├── users/             # User management
│   │   ├── beds/              # Bed management
│   │   ├── patients/          # Patient records
│   │   └── claims/            # Insurance claims
│   ├── login/                 # Login page
│   ├── signup/                # Hospital registration
│   ├── beds/                  # Bed management UI
│   ├── patients/              # Patient management UI
│   └── claims/                # Claims management UI
├── components/
│   ├── AuthProvider.tsx       # Session provider
│   ├── Sidebar.tsx            # Navigation sidebar
│   └── ui/                    # Reusable UI components
├── lib/
│   ├── mongodb.ts             # Database connection
│   ├── types.ts               # TypeScript definitions
│   ├── auth.ts                # Auth utilities
│   └── utils.ts               # Helper functions
├── middleware.ts              # Route protection
├── types/
│   └── next-auth.d.ts         # NextAuth types
└── scripts/
    └── migrate-to-multitenant.ts  # Migration script
```

## 🔐 Security Features

✅ **Password Security**
- Bcrypt hashing (10 rounds)
- No plaintext storage
- Secure comparison

✅ **Session Security**
- JWT tokens with hospital context
- HTTP-only cookies
- 30-day expiry
- Server-side validation

✅ **Data Isolation**
- Separate databases per hospital
- No cross-hospital queries
- HospitalId enforced at API level

✅ **Route Protection**
- Middleware protects all routes
- Auto-redirect to login
- Public routes whitelisted

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access, can create users |
| **Doctor** | Patient management, claims |
| **Nurse** | Patient care, bed management |
| **Staff** | Data entry, basic access |

## 🎯 Usage Examples

### Accessing User Session
```tsx
import { useSession } from 'next-auth/react';

function MyComponent() {
  const { data: session } = useSession();
  
  return (
    <div>
      <h1>{session?.user.hospitalName}</h1>
      <p>{session?.user.name} - {session?.user.role}</p>
    </div>
  );
}
```

### Creating a New User (Admin Only)
```typescript
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Dr. Jane Smith',
    email: 'jane@hospital.com',
    password: 'secure_password',
    role: 'Doctor',
    phone: '+1-234-567-8900',
    department: 'Cardiology'
  })
});
```

### Logging Out
```tsx
import { signOut } from 'next-auth/react';

<button onClick={() => signOut({ callbackUrl: '/login' })}>
  Logout
</button>
```

## 🧪 Testing Multi-Tenancy

1. **Register Hospital A**
   - Code: `hosp_a`
   - Create admin and add 5 beds

2. **Logout and Register Hospital B**
   - Code: `hosp_b`
   - Create admin

3. **Verify Isolation**
   - Hospital B should see 0 beds
   - Create 3 beds for Hospital B
   - Logout and login to Hospital A
   - Hospital A should still show 5 beds only

✅ Complete data isolation confirmed!

## 📊 Database Schema

### hospitals (doklink_main)
```typescript
{
  _id: ObjectId,
  name: string,
  code: string,        // unique
  address: string,
  phone: string,
  email: string,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### users (doklink_main)
```typescript
{
  _id: ObjectId,
  hospitalId: ObjectId,  // references hospitals
  name: string,
  email: string,         // unique
  passwordHash: string,
  role: "Admin" | "Doctor" | "Nurse" | "Staff",
  isActive: boolean,
  phone?: string,
  department?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### All Data Models
Include `hospitalId: ObjectId` for double-isolation

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Add: MONGODB_URI, NEXTAUTH_SECRET, NEXTAUTH_URL
```

### Environment Variables for Production
```env
MONGODB_URI=your_production_mongodb_uri
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://yourdomain.com
```

## 🔄 Migration from Single-Tenant

If you have existing data:

1. Run the migration script:
```bash
npx ts-node scripts/migrate-to-multitenant.ts
```

2. Update hospital and admin details in the script
3. Script will:
   - Create hospital entry
   - Create admin user
   - Move existing data to hospital database

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "MONGODB_URI missing" | Create `.env.local` with MongoDB URI |
| "NEXTAUTH_SECRET missing" | Generate and add secret to `.env.local` |
| "Unauthorized" errors | Check login, verify JWT token |
| Hospital code exists | Use unique code for each hospital |
| Can't see data | Verify hospitalId filtering |

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [MongoDB Multi-Tenancy](https://www.mongodb.com/basics/multi-tenancy)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

## 📞 Support

For support:
1. Check documentation files
2. Review troubleshooting section
3. Check MongoDB and server logs
4. Verify environment variables

## 🎉 What's New

### Version 2.0 - Multi-Tenant Release
- ✨ Complete multi-tenant architecture
- 🔐 NextAuth.js authentication
- 🏥 Hospital registration and management
- 👥 User management system
- 🔒 Complete data isolation
- 📱 Responsive authentication UI
- 📚 Comprehensive documentation

### Previous Features
- Bed management system
- Patient records
- Insurance claims processing
- Medical documents
- Activity logging
- Dark mode support

## 🔮 Future Enhancements

- [ ] Email verification
- [ ] Password reset flow
- [ ] Two-factor authentication
- [ ] User profile management
- [ ] Hospital settings panel
- [ ] Super admin dashboard
- [ ] Analytics and reporting
- [ ] Mobile app (React Native)
- [ ] API webhooks
- [ ] Integration with EHR systems

---

**Built with ❤️ using Next.js, NextAuth.js, MongoDB, and TypeScript**

**Ready for production with enterprise-grade security and scalability! 🚀**
