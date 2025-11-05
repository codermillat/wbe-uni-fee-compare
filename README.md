# University Fee Comparison Tool

A mobile-first, offline-capable web application for Western Bangla Education (WBE) counselors to compare university programs and fees between NIU (Noida International University) and Sharda University for Bangladeshi students.

## 🎯 Purpose

This tool is designed as a **reference and learning tool** for counselors to:
- Understand all available scholarship options transparently
- Compare programs between NIU and Sharda University
- Explain fee structures and savings to students
- Make informed recommendations

**Important**: This is NOT a data-entry tool. Counselors don't enter student names or GPA. Instead, ALL scholarship tiers are displayed for complete transparency.

## ✨ Key Features

### Core Functionality
1. **Program Filtering** - Filter by degree type and field of study
2. **Side-by-Side Comparison** - Compare NIU and Sharda programs simultaneously
3. **Complete Fee Breakdown** - View original fees, scholarship discounts, and final costs
4. **All Scholarship Tiers** - Display ALL scholarship options for transparency:
   - NIU: Flat 50% for all Bangladeshi students
   - Sharda: 4 tiers (20%, 30%, 40%, 50%) based on GPA
5. **Copy to Clipboard** - Share comparisons via WhatsApp/messaging
6. **Mobile-First Design** - Optimized for counselor mobile devices
7. **Offline Capability** - Works without internet (PWA ready)

### Technical Features
- 100% Frontend (No backend, no database)
- React 18 + Vite for fast performance
- Tailwind CSS for responsive design
- LocalStorage for temporary data only
- JSON-based university data

## 📊 Data Structure

### Universities Included
- **NIU (Noida International University)** - 70 programs
- **Sharda University** - 68 programs

### Program Fields
- Engineering (B.Tech, M.Tech, Diploma)
- Allied Health Sciences
- Nursing
- Medical Sciences (MBBS, BDS - Sharda only)
- Management (BBA, MBA)
- Sciences
- Computer Applications (BCA, MCA)
- Architecture
- Pharmacy
- Education
- Journalism
- Law
- Liberal Arts
- PhD Programs

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Server
The app will be available at `http://localhost:5173/`

## 📱 Usage Guide for Counselors

### Step 1: Filter Programs
- Select degree type (B.Tech, MBA, etc.)
- Select field of study (Engineering, Management, etc.)
- View filtered programs in both universities

### Step 2: Compare Programs
- Click any program from NIU list (left side)
- Click any program from Sharda list (right side)
- System automatically matches similar programs

### Step 3: Review Comparison
The comparison shows:

**NIU Section (Green)**
- Original fees breakdown
- 50% scholarship applied (all BD students)
- Total fees after scholarship
- Total savings
- Program highlights

**Sharda Section (Blue)**
- Original fees breakdown
- All 4 scholarship tiers displayed:
  - Gold Tier: 50% (GPA 4.5-5.0)
  - Silver Tier: 40% (GPA 4.0-4.49)
  - Bronze Tier: 30% (GPA 3.5-3.99)
  - Basic Tier: 20% (GPA 0-3.49)
- Total fees for each tier
- Savings for each tier
- Program highlights

### Step 4: Share with Students
- Click "Copy to Clipboard" button
- Paste into WhatsApp, email, or messaging app
- All details included in formatted text

## 💡 Understanding Scholarships

### NIU (Noida International University)
- **Simple & Flat**: 50% scholarship for ALL Bangladeshi students
- **No GPA requirement**: Every student gets the same discount
- **Predictable costs**: Easy to calculate and explain

### Sharda University
- **GPA-Based Tiers**: Four different scholarship levels
- **Higher reward for better grades**: Top performers save more
- **Transparent options**: All tiers shown so students know their options

## 🗂️ Project Structure

```
├── data/
│   └── universities/
│       ├── niu.json          # NIU programs and data
│       └── sharda.json       # Sharda programs and data
├── src/
│   ├── App.jsx               # Main comparison component
│   ├── index.css             # Tailwind styles
│   └── main.jsx              # React entry point
├── index.html                # HTML template
├── tailwind.config.js        # Tailwind configuration
├── postcss.config.js         # PostCSS configuration
├── vite.config.js            # Vite configuration
└── package.json              # Project dependencies
```

## 🎨 Design Philosophy

### Mobile-First
- Primary target: Counselor mobile devices
- Touch-friendly interface
- Readable text sizes
- Efficient data display

### Transparency
- Show ALL scholarship options
- No hidden calculations
- Clear fee breakdowns
- Complete information display

### Simplicity
- No user accounts
- No data entry forms
- No complex workflows
- Instant comparisons

## 🔒 Privacy & Data

- **No personal data collected**: Tool doesn't store student information
- **No backend**: Everything runs in browser
- **No tracking**: No analytics or user monitoring
- **LocalStorage only**: Temporary preferences only

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deployment Options
- **Vercel**: Connect GitHub repo for automatic deployments
- **Netlify**: Drag & drop `dist` folder
- **GitHub Pages**: Use `gh-pages` for hosting
- **Any static hosting**: Upload `dist` folder

### Environment Variables
None required - fully static application

## 📈 Future Enhancements (Optional)

- [ ] PWA offline support with Service Worker
- [ ] Print comparison as PDF
- [ ] Export comparison as image
- [ ] Add more universities
- [ ] Program search functionality
- [ ] Save favorite comparisons
- [ ] Dark mode toggle

## 🐛 Troubleshooting

### Development Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev
```

### Build Issues
```bash
# Clean build
rm -rf dist
npm run build
```

## 📝 License

This project is created for Western Bangla Education (WBE) counselors for educational purposes.

## 👥 Support

For questions or support, contact your WBE technical team.

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Created for**: Western Bangla Education (WBE) Counselors
