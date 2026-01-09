# UI/UX Design Guide

## Color Palette

### Primary Colors

**Primary Blue**
- Hex: `#3b82f6`
- HSL: `hsl(221.2 83.2% 53.3%)`
- Usage: Primary buttons, active nav items, links, icons

**Success Green**
- Hex: `#22c55e`
- Usage: Available beds, approved claims, success badges, positive actions

**Warning Yellow**
- Hex: `#eab308`
- Usage: Maintenance beds, pending claims, warning badges

**Destructive Red**
- Hex: `#ef4444`
- HSL: `hsl(0 84.2% 60.2%)`
- Usage: Occupied beds, rejected claims, destructive actions, alerts

### Neutral Colors

**Gray Scale**
- Background: `#f9fafb` (gray-50)
- Border: `#e5e7eb` (gray-200)
- Text Primary: `#111827` (gray-900)
- Text Secondary: `#6b7280` (gray-500)
- Muted: `#f3f4f6` (gray-100)

### Semantic Colors

**Status Indicators**
```
Available/Approved    → Green (#22c55e)
Occupied/Rejected     → Red (#ef4444)
Maintenance/Pending   → Yellow (#eab308)
Admitted/Active       → Blue (#3b82f6)
Discharged/Inactive   → Gray (#9ca3af)
```

## Typography

### Font Family
- **Primary**: Inter (Google Font)
- **Fallback**: system-ui, sans-serif
- **Monospace**: For IDs and codes

### Font Sizes
```
Heading 1 (Page Title)     → text-3xl (30px) font-bold
Heading 2 (Section)        → text-2xl (24px) font-semibold
Heading 3 (Subsection)     → text-lg (18px) font-semibold
Body (Regular)             → text-sm (14px)
Small Text (Meta)          → text-xs (12px)
Stat Numbers               → text-2xl (24px) font-bold
```

### Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

## Spacing System

### Padding/Margin Scale
```
xs   → 0.125rem (2px)
sm   → 0.25rem (4px)
base → 0.5rem (8px)
md   → 1rem (16px)
lg   → 1.5rem (24px)
xl   → 2rem (32px)
2xl  → 2.5rem (40px)
```

### Page Layout
- Main Container Padding: `p-8` (32px)
- Card Padding: `p-6` (24px)
- Card Content: `p-6 pt-0` (24px horizontal, 0 top)
- Gap Between Cards: `gap-6` or `gap-8` (24px or 32px)

## Component Patterns

### Stat Cards
```tsx
Structure:
- Header with icon (right aligned)
- Large number (text-2xl, bold)
- Small description (text-xs, muted)

Colors by type:
- Beds Total     → Neutral icon
- Occupied       → Red icon & number
- Available      → Green icon & number
- Patients       → Blue icon & number
- Discharges     → Orange icon & number
- Claims         → Purple icon & number
```

### Badges
```tsx
Variants:
- default     → Blue background
- success     → Green background
- warning     → Yellow background
- destructive → Red background
- secondary   → Gray background
- outline     → Border only

Size: px-2.5 py-0.5 (padding)
Font: text-xs font-semibold
Border Radius: rounded-full
```

### Buttons
```tsx
Variants:
- default     → Blue solid
- outline     → Border with transparent bg
- secondary   → Gray solid
- ghost       → Transparent, hover shows bg
- destructive → Red solid
- link        → Text only with underline

Sizes:
- default → h-10 px-4 py-2
- sm      → h-9 px-3
- lg      → h-11 px-8
- icon    → h-10 w-10 (square)

States:
- Hover: Slightly darker
- Focus: Ring outline
- Disabled: Opacity 50%
```

### Cards
```tsx
Structure:
- Rounded corners (rounded-lg)
- Border (1px solid)
- Shadow (shadow-sm)
- White background
- Hover: shadow-lg transition

Header:
- Padding: p-6
- Title: text-2xl font-semibold

Content:
- Padding: p-6 pt-0
```

### Dialogs/Modals
```tsx
Structure:
- Overlay: Black 50% opacity
- Content: White, rounded-lg, shadow-lg
- Max height: 90vh with scroll
- Close button: Top right (X icon)

Sizes:
- Small:  max-w-md
- Medium: max-w-2xl
- Large:  max-w-4xl
- XLarge: max-w-5xl

Header:
- Padding: p-6 pb-4
- Title: text-lg font-semibold
- Description: text-sm text-muted
```

### Tables
```tsx
Structure:
- Header: border-b, font-medium, text-sm
- Rows: border-b, hover:bg-gray-50
- Cell padding: py-3 px-4

Text Alignment:
- Text columns: left
- Numbers: right
- Actions: left or center
```

### Forms
```tsx
Input Fields:
- Height: h-10 (40px)
- Border: border border-input
- Border Radius: rounded-md
- Focus: ring-2 ring-primary

Labels:
- text-sm font-medium mb-1 block

Grid Layout:
- Two columns: grid-cols-2 gap-4
```

## Icon Usage

### Icon Library
Lucide React - Consistent 24x24 stroke icons

### Common Icons
```
LayoutDashboard  → Dashboard/Home
Bed              → Beds/Rooms
Users            → Patients/People
FileText         → Documents/Claims
User             → Individual person
Calendar         → Dates
Heart            → Medical/Health
Pill             → Medications
Phone            → Contact
Mail             → Email
MapPin           → Address
Search           → Search functionality
Plus             → Add new
X                → Close/Delete
CheckCircle      → Success/Approved
XCircle          → Error/Rejected
Clock            → Pending/Waiting
Eye              → View
Download         → Download
Filter           → Filter options
TrendingUp       → Analytics/Growth
Building2        → Organization
DollarSign       → Financial
Activity         → Hospital/Medical
AlertCircle      → Warning/Alert
ChevronLeft/Right → Navigation
UserCheck        → Admission
UserMinus        → Discharge
```

### Icon Sizes
```
Small:  h-4 w-4 (16px) - Table icons, badges
Medium: h-5 w-5 (20px) - Navigation, buttons
Large:  h-6 w-6 (24px) - Headers, avatars
XLarge: h-8 w-8 (32px) - Logo, empty states
```

## Animation & Transitions

### Hover Effects
```css
Default transition: transition-colors
Scale on hover: hover:scale-105 transition-transform
Shadow on hover: hover:shadow-lg transition-shadow
Background on hover: hover:bg-gray-50
```

### Duration
- Fast: 150ms (default)
- Medium: 300ms (sidebar collapse)
- Slow: 500ms (page transitions)

## Layout Patterns

### Grid Systems

**Dashboard Stats**
```
Mobile:   1 column
Tablet:   2 columns
Desktop:  3 columns
XL:       6 columns
```

**Patient/Bed Cards**
```
Mobile:   1 column
Tablet:   2 columns
Desktop:  3 columns
```

**Bed Grid**
```
Mobile:   2 columns
Small:    4 columns
Medium:   6 columns
Large:    8 columns
```

### Responsive Breakpoints
```
sm:  640px  (mobile landscape)
md:  768px  (tablet)
lg:  1024px (desktop)
xl:  1280px (large desktop)
2xl: 1536px (extra large)
```

## Status Visualization

### Bed Status Grid
```
Available:
- Background: bg-green-50
- Border: border-green-300
- Text: text-green-700
- Indicator: bg-green-500 dot

Occupied:
- Background: bg-red-50
- Border: border-red-300
- Text: text-red-700
- Indicator: bg-red-500 dot

Maintenance:
- Background: bg-yellow-50
- Border: border-yellow-300
- Text: text-yellow-700
- Indicator: bg-yellow-500 dot
```

### Progress Bars
```
Container:
- Height: h-4
- Background: bg-secondary (gray)
- Rounded: rounded-full

Fill:
- Background: bg-primary (default)
- Custom: bg-green-500, bg-yellow-500, bg-red-500
- Width: Dynamic based on percentage
- Transition: transition-all
```

### Timeline
```
Structure:
- Vertical line connecting items
- Circular indicators
- Content beside each point

Colors:
- Approved: green circle, green icon
- Rejected: red circle, red icon
- Pending: yellow circle, yellow icon

Spacing:
- Gap between items: space-y-4
- Connector line: h-8
```

## Accessibility

### Focus States
- Ring: `focus-visible:ring-2 focus-visible:ring-ring`
- Offset: `focus-visible:ring-offset-2`
- Outline: `focus-visible:outline-none`

### Screen Readers
- Hidden text: `sr-only` class
- ARIA labels on buttons
- Semantic HTML structure

### Keyboard Navigation
- Tab order follows visual order
- Enter/Space for buttons
- Escape closes dialogs

## Best Practices

### Do's ✅
- Use consistent spacing (multiples of 4px)
- Maintain color semantics across app
- Use icons with text labels
- Provide visual feedback on interactions
- Keep contrast ratios accessible (WCAG AA)
- Use loading states for async operations
- Show empty states with helpful messages

### Don'ts ❌
- Don't mix different icon styles
- Don't use too many colors
- Don't forget hover/focus states
- Don't make clickable items too small
- Don't use color alone to convey information
- Don't auto-play animations
- Don't override focus indicators

## Component Hierarchy

### Information Architecture
```
Level 1: Page Title (text-3xl)
Level 2: Section Headers (text-2xl)
Level 3: Subsection Headers (text-lg)
Level 4: Card Titles (text-lg or font-semibold)
Level 5: Body Text (text-sm)
Level 6: Meta Information (text-xs text-muted)
```

### Z-Index Layers
```
z-0:  Base content
z-10: Dropdowns, tooltips
z-40: Modals
z-50: Modal content, overlays
z-60: Notifications (if added)
```

## Responsive Design Strategy

### Mobile First
1. Design for mobile (320px+)
2. Add tablet breakpoint (md:)
3. Enhance for desktop (lg:)
4. Optimize for large screens (xl:)

### Touch Targets
- Minimum size: 44x44px
- Adequate spacing between interactive elements
- Clear visual feedback on tap

### Mobile Optimizations
- Stack navigation vertically
- Full-width buttons on small screens
- Collapsible sections
- Simplified tables (card view alternative)

---

**Design Philosophy**: Clean, Professional, Healthcare-Appropriate

The design prioritizes:
- **Clarity**: Information is easy to find and understand
- **Consistency**: Patterns repeat across the application
- **Accessibility**: Usable by everyone
- **Responsiveness**: Works on all devices
- **Professionalism**: Suitable for healthcare environment
