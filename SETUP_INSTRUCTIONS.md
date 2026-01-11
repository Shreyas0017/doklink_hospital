# 🔧 Environment Setup Instructions

## Step-by-Step Guide to Get Your System Running

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Git (optional)

---

## 1. Install Dependencies ✅ (Already Done)

The `bcryptjs` package has been installed. You're good to go!

```bash
# If you need to reinstall
npm install
```

---

## 2. Setup MongoDB

### Option A: MongoDB Atlas (Recommended - Free)

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free

2. **Create Cluster**
   - Click "Create" → "Shared" (Free)
   - Choose region closest to you
   - Cluster Name: "DokLink" (or any name)
   - Click "Create Cluster"

3. **Setup Database Access**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `doklink_admin`
   - Password: Generate secure password
   - Role: "Atlas admin"
   - Click "Add User"

4. **Setup Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Confirm

5. **Get Connection String**
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://username:<password>@cluster.mongodb.net/...`
   - Replace `<password>` with your actual password

### Option B: Local MongoDB

```bash
# Install MongoDB Community Edition
# Windows: https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB
mongod

# Connection string will be:
mongodb://localhost:27017
```

---

## 3. Create Environment File

Create a file named `.env.local` in the root directory:

```bash
# Windows PowerShell
New-Item -Path .env.local -ItemType File

# Linux/Mac
touch .env.local
```

Add this content to `.env.local`:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

# NextAuth Secret (generate a random string)
NEXTAUTH_SECRET=your_generated_secret_here

# NextAuth URL
NEXTAUTH_URL=http://localhost:3000
```

---

## 4. Generate NEXTAUTH_SECRET

You need a random secret for JWT signing.

### Windows (PowerShell)
```powershell
# Open PowerShell and run:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

### Linux/Mac (Terminal)
```bash
openssl rand -base64 32
```

### Online Generator
Go to https://generate-secret.vercel.app/32

Copy the generated secret and paste it in `.env.local`

---

## 5. Verify Your .env.local File

Your `.env.local` should look like this:

```env
# MongoDB Connection String (REPLACE WITH YOUR ACTUAL URI)
MONGODB_URI=mongodb+srv://doklink_admin:MySecurePassword123@cluster0.abcd123.mongodb.net/?retryWrites=true&w=majority

# NextAuth Secret (REPLACE WITH YOUR GENERATED SECRET)
NEXTAUTH_SECRET=abcdef123456789ghijklmnop987654321qrstuvwxyz

# NextAuth URL (keep as is for local development)
NEXTAUTH_URL=http://localhost:3000
```

**⚠️ IMPORTANT:**
- Never commit `.env.local` to Git
- Use different secrets for production
- Keep your MongoDB password secure

---

## 6. Test MongoDB Connection

Create a test file `test-db.js`:

```javascript
const { MongoClient } = require('mongodb');

const uri = "YOUR_MONGODB_URI_HERE";
const client = new MongoClient(uri);

async function testConnection() {
  try {
    await client.connect();
    console.log("✅ MongoDB connected successfully!");
    await client.close();
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
  }
}

testConnection();
```

Run it:
```bash
node test-db.js
```

If you see "✅ MongoDB connected successfully!", you're ready!

---

## 7. Start Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in X.Xs
```

---

## 8. First Use

1. **Open Browser**
   ```
   http://localhost:3000
   ```

2. **You'll be redirected to:**
   ```
   http://localhost:3000/login
   ```

3. **Click "Register Hospital"**
   - This takes you to `/signup`

4. **Complete Registration**
   - Fill in hospital details
   - Create admin account
   - Submit

5. **Login**
   - Use the email/password you just created
   - You should see the dashboard!

---

## 9. Verify Everything Works

### Check Database
Go to MongoDB Atlas → Browse Collections

You should see:
```
doklink_main
├── hospitals (1 document)
└── users (1 document)

doklink_hospital_<your_hospital_id>
├── beds (empty initially)
├── patients (empty initially)
└── ... (other collections)
```

### Check Authentication
1. You should see your hospital name in sidebar
2. Your name and role displayed
3. Logout button visible
4. Can navigate between pages

### Test Adding Data
1. Go to "Bed Management"
2. Click "Add New Bed"
3. Fill in details
4. Submit
5. Bed should appear in the grid

---

## 🔍 Troubleshooting

### "MONGODB_URI missing"
**Problem:** `.env.local` doesn't exist or is empty

**Solution:**
1. Create `.env.local` file in root directory
2. Add MONGODB_URI line
3. Restart development server

### "NEXTAUTH_SECRET missing"
**Problem:** NEXTAUTH_SECRET not set

**Solution:**
1. Generate secret using methods above
2. Add to `.env.local`
3. Restart development server

### "Invalid credentials"
**Problem:** Wrong email/password

**Solution:**
1. Double-check email and password
2. Try registering a new hospital
3. Clear browser cookies and try again

### "Failed to fetch"
**Problem:** Server not running or wrong port

**Solution:**
1. Ensure `npm run dev` is running
2. Check terminal for errors
3. Try http://localhost:3000 (not https)

### MongoDB Connection Timeout
**Problem:** Can't connect to MongoDB

**Solution:**
1. Check Network Access in MongoDB Atlas
2. Add "Allow Access from Anywhere"
3. Verify connection string is correct
4. Check password has no special characters that need encoding

### Can't Create Hospital
**Problem:** Hospital code already exists

**Solution:**
1. Use a different hospital code
2. Each code must be unique
3. Try adding a number: hosp_001, hosp_002, etc.

---

## 🎉 Success Checklist

- [ ] Node.js installed
- [ ] MongoDB setup complete
- [ ] `.env.local` created with all variables
- [ ] Dependencies installed (`npm install`)
- [ ] Development server running (`npm run dev`)
- [ ] Can access http://localhost:3000
- [ ] Redirects to `/login`
- [ ] Can register new hospital at `/signup`
- [ ] Can login with created account
- [ ] See hospital name in sidebar
- [ ] Can add beds/patients
- [ ] Data persists after refresh

---

## 📁 Project Structure Check

Make sure you have these files:

```
doklink__hospital/
├── .env.local ← YOU CREATE THIS
├── package.json ✅
├── next.config.js ✅
├── app/
│   ├── login/
│   │   └── page.tsx ✅
│   ├── signup/
│   │   └── page.tsx ✅
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts ✅
├── components/
│   └── AuthProvider.tsx ✅
├── lib/
│   └── mongodb.ts ✅
└── middleware.ts ✅
```

---

## 🚀 Next Steps After Setup

1. **Read Documentation**
   - `QUICK_START_AUTH.md` - Quick reference
   - `AUTHENTICATION_GUIDE.md` - Complete guide
   - `ARCHITECTURE_DIAGRAM.md` - System architecture

2. **Customize**
   - Update hospital name in Sidebar
   - Add your logo
   - Customize colors in tailwind.config.ts

3. **Add Users**
   - Create API call to `/api/users`
   - Build admin panel for user management

4. **Deploy**
   - When ready, deploy to Vercel
   - Update NEXTAUTH_URL in production
   - Use production MongoDB cluster

---

## 🎯 Quick Command Reference

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check for issues
npm run lint
```

---

## 🔐 Security Reminders

1. **Never commit .env.local**
   - Already in .gitignore
   - Contains sensitive data

2. **Use strong passwords**
   - For MongoDB user
   - For admin accounts
   - For NEXTAUTH_SECRET

3. **Restrict MongoDB Access**
   - In production, use specific IP addresses
   - Don't use "Allow Access from Anywhere"

4. **Change default passwords**
   - After first login
   - Use password requirements

---

## 📞 Need Help?

If you're stuck:

1. Check terminal for error messages
2. Check browser console (F12)
3. Review the troubleshooting section above
4. Read the error message carefully
5. Check MongoDB Atlas logs

---

**You're all set! Start building amazing features! 🎊**
