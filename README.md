# Hospital Management System

A comprehensive Hospital Management System built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### 🏥 Dashboard (Home Page)
- **Overview Statistics**: Total Beds, Occupied Beds, Available Beds, Total Patients, Pending Discharges, Active Claims
- **Bed Status Widget**: Visual grid showing occupied/available/maintenance beds organized by ward
- **Recent Activity Feed**: Real-time updates on admissions, discharges, and claim updates
- **Performance Chart**: Weekly patient admissions and discharges visualization
- **Patient List Widget**: Quick view of current admitted patients

### 🛏️ Bed Management
- **Visual Bed Grid**: Organized by ward (General, ICU, Pediatric, Maternity, Emergency)
- **Color-Coded Status**: 
  - Green: Available
  - Red: Occupied
  - Yellow: Maintenance
- **Interactive Bed Details**: Click any bed to view patient information or assign new patients
- **Add New Beds**: Create beds with ward assignment and bed number
- **Advanced Filters**: Filter beds by ward and status
- **Ward Statistics**: Real-time occupancy rates per ward

### 👥 Patient Management
- **Patient List**: Comprehensive patient cards with search and filter
- **Patient Cards**: Display name, ID, age, gender, admission date, diagnosis, assigned bed
- **Add New Patient**: Full admission dialog with all required details
- **Patient Details**: Multi-tab interface with:
  - **Overview Tab**: Personal information and admission details
  - **Medical Tab**: Blood group, allergies, medications
  - **Documents Tab**: All patient reports, prescriptions, lab results, discharge summaries
- **Document Management**: Filter documents by type with view/download options
- **Discharge Workflow**: Initiate discharge with automatic document generation

### 💰 Insurance & Claims
- **Claims Table**: Comprehensive view of all claims with patient, policy, insurer, amounts, status
- **Create Manual Claims**: Patient selection, policy details, diagnosis, treatment
- **Detailed Claim View**: 
  - **Expense Approval Summary**: Visual breakdown of total, approved, pending, rejected amounts
  - **Progress Bars**: Visual indicators for approval percentages
  - **Patient Liability**: Tracking remaining amount to be paid
  - **Daily Expense Breakdown**: Individual line items with approval status
  - **Approval History Timeline**: Chronological view of insurance company decisions
  - **Financial Summary**: Complete overview of claim financials

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with shadcn/ui patterns
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Project Structure

```
doklink__hospital/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── beds/
│   │   └── page.tsx          # Bed Management
│   ├── patients/
│   │   └── page.tsx          # Patient Management
│   ├── claims/
│   │   └── page.tsx          # Insurance & Claims
│   ├── layout.tsx            # Root layout with sidebar
│   └── globals.css           # Global styles
├── components/
│   ├── Sidebar.tsx           # Navigation sidebar
│   └── ui/                   # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── badge.tsx
│       ├── dialog.tsx
│       ├── tabs.tsx
│       ├── progress.tsx
│       └── select.tsx
├── lib/
│   ├── types.ts              # TypeScript type definitions
│   ├── data.ts               # Mock data
│   └── utils.ts              # Utility functions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## UI/UX Features

### Design Elements
- **Collapsible Sidebar**: Toggle navigation with icons and labels
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Professional Color Scheme**: Healthcare-appropriate blue and white theme
- **Status Badges**: Semantic colors (green for success, red for errors, yellow for warnings)
- **Dialog-based Forms**: Clean, non-intrusive user interactions
- **Tabbed Interfaces**: Organized complex information in patient and claim details
- **Progress Indicators**: Visual feedback for approval statuses

### Color Coding
- **Green**: Available, Approved, Success states
- **Red**: Occupied, Rejected, Destructive actions
- **Yellow**: Maintenance, Pending, Warning states
- **Blue**: Primary actions, Selected items
- **Gray**: Neutral states, Discharged patients

## Key Components

### Dashboard Stats
Real-time statistics cards showing:
- Hospital capacity and bed occupancy
- Current patient count
- Pending discharges
- Active insurance claims

### Bed Grid Visualization
Interactive bed management system with:
- Ward-wise organization
- Click-to-view patient details
- Visual status indicators
- Occupancy percentages

### Patient Cards
Comprehensive patient information cards with:
- Personal details
- Medical information
- Document management
- Discharge workflows

### Claims Management
Advanced insurance claim tracking with:
- Financial breakdowns
- Approval tracking
- Expense itemization
- Patient liability calculation

## Mock Data

The application includes comprehensive mock data for demonstration:
- 22 beds across 5 wards
- 10 patients (8 admitted, 2 discharged)
- 9 patient documents
- 4 insurance claims with detailed expenses and approval history
- Recent activity feed

## Future Enhancements

Potential features for expansion:
- [ ] Real database integration (PostgreSQL/MongoDB)
- [ ] Authentication and authorization
- [ ] Role-based access control (Admin, Doctor, Nurse, Receptionist)
- [ ] Real-time notifications
- [ ] Appointment scheduling
- [ ] Billing and invoicing
- [ ] Staff management
- [ ] Pharmacy integration
- [ ] Laboratory management
- [ ] Report generation and analytics
- [ ] PDF export functionality
- [ ] Email notifications
- [ ] Audit logs

## Development Notes

### Type Safety
The application uses TypeScript for complete type safety across:
- Patient records
- Bed assignments
- Insurance claims
- Document management

### State Management
Currently uses React's built-in state management. For production, consider:
- Redux Toolkit for complex state
- React Query for server state
- Zustand for lightweight global state

### API Integration
To connect to a backend API:
1. Create API routes in `app/api/`
2. Replace mock data imports with API calls
3. Add loading and error states
4. Implement optimistic updates

## Contributing

This is a demonstration project. For production use:
1. Implement proper authentication
2. Add data validation
3. Connect to real database
4. Add comprehensive error handling
5. Implement proper security measures

## License

This project is for educational and demonstration purposes.

---

**Built with ❤️ using Next.js and TypeScript**
