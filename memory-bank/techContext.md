# Technical Context

## Technology Stack

### Frontend Framework
**React 18.x**
- Functional components with hooks
- React Router for navigation
- Context API for state management
- No Redux (keeping it simple)

### Build Tools
**Vite**
- Fast development server
- Optimized production builds
- Hot Module Replacement (HMR)
- Better than Create React App for performance

### Styling
**Tailwind CSS**
- Utility-first CSS framework
- Mobile-first responsive design
- Custom configuration for WBE branding
- Dark mode support (optional)

### PWA Support
**Workbox**
- Service worker generation
- Offline caching strategies
- Background sync
- Install prompts

### State Management
**React Context + Hooks**
- `useContext` for global state
- `useState` for local state
- `useMemo` for computed values
- `useCallback` for memoized functions

### Data Management
**JSON + Local Storage**
- Static JSON files for university data
- LocalStorage for user preferences
- IndexedDB for offline data (if needed)

## Development Setup

### Prerequisites
```bash
# Required
Node.js >= 18.x
npm >= 9.x

# Optional but recommended
Git
VS Code with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Prettier
  - ESLint
```

### Project Initialization
```bash
# Create React app with Vite
npm create vite@latest wbe-counselor-tool -- --template react

# Navigate to project
cd wbe-counselor-tool

# Install dependencies
npm install

# Install additional packages
npm install react-router-dom
npm install -D tailwindcss postcss autoprefixer
npm install workbox-webpack-plugin
npm install react-icons
npm install jspdf jspdf-autotable  # For PDF generation
```

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
wbe-counselor-tool/
├── public/
│   ├── favicon.ico
│   ├── manifest.json          # PWA manifest
│   ├── robots.txt
│   └── icons/                 # PWA icons (various sizes)
│       ├── icon-192x192.png
│       └── icon-512x512.png
├── src/
│   ├── assets/
│   │   ├── images/            # University logos, etc.
│   │   └── fonts/             # Custom fonts if needed
│   ├── components/
│   │   ├── common/            # Reusable components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Loading.jsx
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Navigation.jsx
│   │   ├── search/
│   │   │   ├── SearchBar.jsx
│   │   │   ├── SearchResults.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   └── ProgramCard.jsx
│   │   ├── comparison/
│   │   │   ├── ComparisonView.jsx
│   │   │   ├── ComparisonTable.jsx
│   │   │   └── ComparisonCard.jsx
│   │   ├── calculator/
│   │   │   ├── FeeCalculator.jsx
│   │   │   ├── FeeBreakdown.jsx
│   │   │   └── YearlyTimeline.jsx
│   │   ├── university/
│   │   │   ├── UniversityCard.jsx
│   │   │   ├── UniversityProfile.jsx
│   │   │   ├── RankingsSection.jsx
│   │   │   └── FAQSection.jsx
│   │   └── program/
│   │       ├── ProgramDetail.jsx
│   │       ├── ProgramOverview.jsx
│   │       └── CareerProspects.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Search.jsx
│   │   ├── ProgramDetails.jsx
│   │   ├── Comparison.jsx
│   │   └── UniversityProfile.jsx
│   ├── data/
│   │   ├── universities/
│   │   │   ├── niu.json
│   │   │   └── sharda.json
│   │   ├── programs/
│   │   │   ├── niu-programs.json
│   │   │   └── sharda-programs.json
│   │   └── scholarships/
│   │       ├── niu-scholarships.json
│   │       └── sharda-scholarships.json
│   ├── utils/
│   │   ├── searchEngine.js     # Search algorithms
│   │   ├── feeCalculator.js    # Fee calculation logic
│   │   ├── scholarshipEngine.js # Scholarship logic
│   │   ├── formatters.js       # Number, currency formatters
│   │   ├── validators.js       # Input validation
│   │   └── copyToClipboard.js  # Copy functionality
│   ├── hooks/
│   │   ├── useSearch.js        # Custom search hook
│   │   ├── useComparison.js    # Comparison state hook
│   │   ├── useFeeCalculator.js # Fee calculation hook
│   │   └── useLocalStorage.js  # Local storage hook
│   ├── context/
│   │   ├── DataContext.jsx     # University & program data
│   │   ├── SearchContext.jsx   # Search state
│   │   └── ComparisonContext.jsx # Comparison state
│   ├── constants/
│   │   ├── routes.js           # Route paths
│   │   ├── filters.js          # Filter options
│   │   └── config.js           # App configuration
│   ├── styles/
│   │   ├── index.css           # Global styles
│   │   └── tailwind.css        # Tailwind imports
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── sw.js                   # Service worker
├── .env                        # Environment variables
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
└── README.md
```

## Key Dependencies

### Production Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "react-icons": "^4.12.0",
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.8.0"
}
```

### Development Dependencies
```json
{
  "@vitejs/plugin-react": "^4.2.0",
  "vite": "^5.0.0",
  "tailwindcss": "^3.3.6",
  "postcss": "^8.4.32",
  "autoprefixer": "^10.4.16",
  "eslint": "^8.55.0",
  "eslint-plugin-react": "^7.33.2",
  "prettier": "^3.1.0",
  "workbox-webpack-plugin": "^7.0.0"
}
```

## Configuration Files

### vite.config.js
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'WBE Counselor Tool',
        short_name: 'WBE Tool',
        description: 'University Fee Comparison Tool for WBE Counselors',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: false
  }
});
```

### tailwind.config.js
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',    // WBE brand blue
        secondary: '#64748b',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      }
    },
  },
  plugins: [],
}
```

## API & Data Structure

### No Backend API
- All data stored in static JSON files
- Data loaded at app initialization
- Cached in memory for fast access

### Data Loading Pattern
```javascript
// DataContext.jsx
import niuData from '../data/universities/niu.json';
import shardaData from '../data/universities/sharda.json';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [universities, setUniversities] = useState([niuData, shardaData]);
  const [programs, setPrograms] = useState([]);
  
  useEffect(() => {
    // Flatten all programs from all universities
    const allPrograms = universities.flatMap(uni => 
      uni.schools.flatMap(school => 
        school.programs.map(program => ({
          ...program,
          universityId: uni.id,
          universityName: uni.name,
          schoolName: school.name
        }))
      )
    );
    setPrograms(allPrograms);
  }, [universities]);
  
  return (
    <DataContext.Provider value={{ universities, programs }}>
      {children}
    </DataContext.Provider>
  );
};
```

## Deployment Strategy

### Hosting Options
1. **Vercel** (Recommended)
   - Free tier available
   - Automatic deployments from Git
   - Global CDN
   - SSL included

2. **Netlify**
   - Similar to Vercel
   - Good free tier
   - Easy setup

3. **GitHub Pages**
   - Free for public repos
   - Simple deployment
   - Good for static sites

### Build & Deploy
```bash
# Build for production
npm run build

# Output in dist/ directory
# Upload to hosting service

# OR use Vercel CLI
npm i -g vercel
vercel
```

### Environment Variables
```bash
# .env
VITE_APP_NAME="WBE Counselor Tool"
VITE_WBE_PHONE="+8801611533385"
VITE_WBE_WEBSITE="https://www.westernbanglaedu.co.in"
```

## Performance Optimization

### Code Splitting
```javascript
// Lazy load routes
const Home = lazy(() => import('./pages/Home'));
const Search = lazy(() => import('./pages/Search'));
const Comparison = lazy(() => import('./pages/Comparison'));

// Use Suspense
<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/search" element={<Search />} />
    <Route path="/compare" element={<Comparison />} />
  </Routes>
</Suspense>
```

### Image Optimization
- Use WebP format with fallback
- Lazy load images below fold
- Use proper srcset for responsive images
- Compress all images

### Bundle Size Optimization
- Tree shaking enabled
- Remove unused dependencies
- Use dynamic imports
- Minimize vendor chunks

## Browser Support

### Target Browsers
- Chrome/Edge (last 2 versions)
- Safari (last 2 versions)
- Firefox (last 2 versions)
- Mobile Safari (iOS 12+)
- Chrome Mobile (Android 8+)

### Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced features with JavaScript enabled
- Offline functionality with service worker

## Testing Strategy

### Manual Testing Checklist
- [ ] Test on actual mobile devices (Android & iOS)
- [ ] Test offline functionality
- [ ] Test search with various queries
- [ ] Test fee calculations for accuracy
- [ ] Test copy/share functionality
- [ ] Test on slow 3G connection
- [ ] Test with screen reader (accessibility)

### Device Testing Priority
1. Android phones (320px - 480px width)
2. iPhone (375px - 428px width)
3. Tablets (768px - 1024px width)
4. Desktop (1280px+ width)

## Security Considerations

### Data Privacy
- No user data sent to servers
- No analytics tracking (unless required)
- No cookies needed
- LocalStorage only for preferences

### Content Security
- Sanitize any user inputs
- Validate GPA inputs
- Prevent XSS attacks

## Maintenance Plan

### Data Updates
- University fee data: Update annually or as needed
- Program additions: Update JSON files as new programs added
- Rankings: Update when new rankings released

### Version Control
- Use semantic versioning (v1.0.0)
- Tag releases in Git
- Maintain CHANGELOG.md
