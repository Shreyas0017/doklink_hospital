# Quick Start Guide

## Installation & Setup

Follow these steps to get your Hospital Management System up and running:

### Step 1: Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- date-fns (date utilities)

### Step 2: Start Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

### Step 3: Explore the Application

The system has 4 main sections accessible from the sidebar:

#### 1. **Dashboard** (Home)
- View hospital overview statistics
- See bed occupancy grid by ward
- Check recent activities
- View weekly performance chart
- Quick access to current patients

#### 2. **Bed Management** (`/beds`)
- Visual bed grid with color coding
- Filter by ward or status
- Click any bed to see details
- Add new beds to the system
- View patient information for occupied beds

#### 3. **Patient Management** (`/patients`)
- Browse all patients (admitted and discharged)
- Search by name or patient ID
- Filter by admission status
- Click patient card for detailed view with tabs:
  - Overview: Personal and admission details
  - Medical: Blood group, allergies, medications
  - Documents: All patient documents with filters
- Add new patients
- Initiate discharge process

#### 4. **Insurance & Claims** (`/claims`)
- View all insurance claims in table format
- Search by patient, policy number, or insurer
- Click "View Details" to see comprehensive claim information:
  - Financial summary with visual indicators
  - Expense approval breakdown with progress bars
  - Patient liability calculation
  - Daily expense itemization
  - Approval history timeline
- Create new claims

## Understanding the Mock Data

The application includes pre-populated data for testing:

- **22 Beds** across 5 wards (General, ICU, Pediatric, Maternity, Emergency)
- **10 Patients**: 8 currently admitted, 2 discharged
- **9 Documents**: Various reports, prescriptions, and lab results
- **4 Insurance Claims**: With detailed expense tracking and approval history

## Key Features to Test

### 1. Bed Management
- Click on different bed numbers to see patient details
- Notice color coding: Green (available), Red (occupied), Yellow (maintenance)
- Try the ward and status filters

### 2. Patient Details
- Click any patient card to open detailed view
- Switch between Overview, Medical, and Documents tabs
- In Documents tab, use the filter dropdown
- Click "Initiate Discharge" for admitted patients

### 3. Claim Details
- Click "View Details" on any claim
- Scroll through the comprehensive breakdown
- Notice the progress bars showing approval percentages
- Check the approval history timeline at the bottom

### 4. Responsive Sidebar
- Click the collapse button at the bottom of the sidebar
- Watch the sidebar minimize to icons only
- Click again to expand

## Development Tips

### File Structure

```
Key files to explore:
├── app/page.tsx              → Dashboard with stats and charts
├── app/beds/page.tsx         → Bed management interface
├── app/patients/page.tsx     → Patient management system
├── app/claims/page.tsx       → Insurance claims module
├── lib/data.ts               → Mock data (modify here for testing)
├── lib/types.ts              → TypeScript type definitions
└── components/Sidebar.tsx    → Navigation component
```

### Customizing Mock Data

Edit `lib/data.ts` to:
- Add more patients
- Create additional beds
- Add new insurance claims
- Modify existing data

### Modifying Styles

The application uses Tailwind CSS. Key color variables are in:
- `app/globals.css` - CSS variables for theme colors
- `tailwind.config.ts` - Tailwind configuration

## Building for Production

When ready to deploy:

```bash
# Build the application
npm run build

# Start production server
npm start
```

The optimized build will be in the `.next` folder.

## Common Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Run production build

# Code Quality
npm run lint         # Run ESLint
```

## Browser Requirements

- Modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Minimum resolution: 1280x720 for optimal experience
- Responsive design works on tablets and mobile devices

## Troubleshooting

### Port Already in Use
If port 3000 is busy:
```bash
# Windows
npm run dev -- -p 3001

# The app will run on http://localhost:3001
```

### Module Not Found
If you see module errors:
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### TypeScript Errors
The project uses strict TypeScript. If you see type errors:
- Check `tsconfig.json` for configuration
- Ensure all dependencies are installed
- Run `npm run build` to see detailed errors

## Next Steps

1. **Explore the UI**: Click through all features
2. **Review the Code**: Check component structure in each page
3. **Modify Data**: Update `lib/data.ts` to test with different scenarios
4. **Customize Theme**: Adjust colors in `app/globals.css`
5. **Add Features**: Extend functionality based on requirements

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review type definitions in `lib/types.ts`
- Examine component code for implementation details

---

**Happy Coding! 🏥💻**
