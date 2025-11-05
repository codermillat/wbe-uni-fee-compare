# System Patterns

## Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────┐
│         Mobile Browser (PWA)            │
│  ┌───────────────────────────────────┐  │
│  │      React Application            │  │
│  │  ┌──────────────────────────────┐ │  │
│  │  │   UI Components Layer        │ │  │
│  │  │  - Search                    │ │  │
│  │  │  - Comparison                │ │  │
│  │  │  - Calculator                │ │  │
│  │  │  - University Profiles       │ │  │
│  │  └──────────────────────────────┘ │  │
│  │  ┌──────────────────────────────┐ │  │
│  │  │   Business Logic Layer       │ │  │
│  │  │  - Search Engine             │ │  │
│  │  │  - Fee Calculator            │ │  │
│  │  │  - Comparison Engine         │ │  │
│  │  │  - Filter Logic              │ │  │
│  │  └──────────────────────────────┘ │  │
│  │  ┌──────────────────────────────┐ │  │
│  │  │   Data Layer (JSON)          │ │  │
│  │  │  - University Data           │ │  │
│  │  │  - Course Data               │ │  │
│  │  │  - Profile Data              │ │  │
│  │  └──────────────────────────────┘ │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │   Service Worker (Offline)        │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Data Structure Design

### University Data Model
```javascript
{
  "id": "niu",
  "name": "Noida International University",
  "shortName": "NIU",
  "location": "Greater Noida, UP, India",
  "profile": {
    "rankings": {
      "nirf": "201-250",
      "naac": "A+",
      "established": 2010
    },
    "highlights": [
      "300+ acre green campus",
      "Industry partnerships with TCS, IBM",
      "100% placement assistance"
    ],
    "facilities": [...],
    "placements": {
      "averagePackage": "4.5 LPA",
      "highestPackage": "24 LPA",
      "topRecruiters": [...]
    }
  },
  "scholarships": {
    "type": "flat",
    "bangladeshStudents": {
      "percentage": 50,
      "conditions": "No GPA requirement"
    }
  },
  "additionalFees": {
    "oneTime": {
      "amount": 36000,
      "services": [...]
    }
  },
  "schools": [
    {
      "name": "School of Engineering and Technology",
      "programs": [...]
    }
  ]
}
```

### Program Data Model
```javascript
{
  "id": "btech-cse-niu",
  "universityId": "niu",
  "schoolName": "School of Engineering and Technology",
  "programName": "B.Tech",
  "specialization": "Computer Science & Engineering",
  "degree": "Bachelor",
  "field": "Engineering",
  "subField": "Computer Science",
  "duration": 4,
  "durationUnit": "years",
  "fees": {
    "annual": [206000, 206000, 206000, 206000],
    "currency": "INR"
  },
  "scholarshipEligible": true,
  "highlights": [
    "Industry-ready curriculum",
    "Modern labs and infrastructure",
    "Strong placement record"
  ],
  "careerProspects": [
    "Software Engineer",
    "Data Scientist",
    "System Architect"
  ],
  "curriculum": {
    "description": "Comprehensive CS education...",
    "keySubjects": [...]
  }
}
```

### Scholarship Calculation Model
```javascript
{
  "universityId": "sharda",
  "rules": {
    "categories": {
      "category1": {
        "programs": ["B.Tech", "BBA", "MBA", ...],
        "tiers": [
          { "gpaMin": 3.5, "gpaMax": 5.0, "discount": 50 },
          { "gpaMin": 3.0, "gpaMax": 3.49, "discount": 20 }
        ]
      },
      "category2": {
        "programs": ["B.Sc. Nursing"],
        "tiers": [
          { "gpaMin": 3.0, "gpaMax": 5.0, "discount": 25 }
        ]
      },
      "category3": {
        "programs": ["B.Sc.", "B.A.", "M.Sc.", "M.A."],
        "tiers": [
          { "gpaMin": 3.0, "gpaMax": 5.0, "discount": 20 }
        ]
      },
      "category4": {
        "programs": ["Pharmacy", "M.Sc. Nursing", "MPT", "BDS", "MBBS"],
        "discount": 0
      }
    }
  }
}
```

## Core Algorithms

### Search Algorithm
```javascript
function searchPrograms(query, universities) {
  // 1. Tokenize and normalize query
  const tokens = normalizeQuery(query);
  
  // 2. Search across multiple fields
  const results = [];
  for (const university of universities) {
    for (const program of university.programs) {
      const score = calculateRelevance(tokens, program);
      if (score > THRESHOLD) {
        results.push({ program, university, score });
      }
    }
  }
  
  // 3. Sort by relevance score
  results.sort((a, b) => b.score - a.score);
  
  return results;
}

function calculateRelevance(tokens, program) {
  let score = 0;
  
  // Exact match in program name: +10 points
  if (matchesExactly(tokens, program.programName)) score += 10;
  
  // Match in specialization: +8 points
  if (matchesExactly(tokens, program.specialization)) score += 8;
  
  // Match in field: +5 points
  if (matchesPartially(tokens, program.field)) score += 5;
  
  // Match in subField: +3 points
  if (matchesPartially(tokens, program.subField)) score += 3;
  
  return score;
}
```

### Fee Calculator Algorithm
```javascript
function calculateTotalCost(program, university, studentGPA) {
  // 1. Get base fees for all years
  const baseFees = program.fees.annual;
  
  // 2. Calculate scholarship discount
  const scholarshipPercent = getScholarshipPercent(
    university,
    program,
    studentGPA
  );
  
  // 3. Apply scholarship to tuition fees
  const tuitionFees = baseFees.map(fee => 
    fee * (1 - scholarshipPercent / 100)
  );
  
  // 4. Add additional fees
  const additionalFees = calculateAdditionalFees(
    university,
    program.duration
  );
  
  // 5. Build year-wise breakdown
  const breakdown = [];
  for (let year = 0; year < program.duration; year++) {
    breakdown.push({
      year: year + 1,
      tuition: tuitionFees[year],
      additional: additionalFees[year],
      total: tuitionFees[year] + additionalFees[year]
    });
  }
  
  // 6. Calculate totals
  const totalTuition = sum(tuitionFees);
  const totalAdditional = sum(additionalFees.map(f => f || 0));
  const grandTotal = totalTuition + totalAdditional;
  const totalSavings = sum(baseFees) - totalTuition;
  
  return {
    breakdown,
    summary: {
      totalTuition,
      totalAdditional,
      grandTotal,
      totalSavings,
      scholarshipPercent
    }
  };
}

function getScholarshipPercent(university, program, gpa) {
  if (university.id === 'niu') {
    return 50; // Flat 50% for all BD students
  }
  
  if (university.id === 'sharda') {
    // Find scholarship category
    const category = findScholarshipCategory(program);
    
    // Find applicable tier based on GPA
    for (const tier of category.tiers) {
      if (gpa >= tier.gpaMin && gpa <= tier.gpaMax) {
        return tier.discount;
      }
    }
  }
  
  return 0; // No scholarship
}
```

### Comparison Engine
```javascript
function comparePrograms(programIds, gpa) {
  const comparisons = [];
  
  for (const id of programIds) {
    const { program, university } = findProgram(id);
    const costs = calculateTotalCost(program, university, gpa);
    
    comparisons.push({
      program,
      university,
      costs,
      rankings: university.profile.rankings,
      highlights: program.highlights,
      careerProspects: program.careerProspects
    });
  }
  
  // Add comparison indicators
  const lowestCost = Math.min(...comparisons.map(c => c.costs.summary.grandTotal));
  const highestRanking = comparisons.reduce((best, current) => 
    (current.rankings.nirf < best.rankings.nirf) ? current : best
  );
  
  comparisons.forEach(comp => {
    comp.indicators = {
      isLowestCost: comp.costs.summary.grandTotal === lowestCost,
      isHighestRanked: comp === highestRanking,
      isBestValue: calculateValueScore(comp) // Custom logic
    };
  });
  
  return comparisons;
}
```

### Filter Logic
```javascript
function applyFilters(programs, filters) {
  return programs.filter(program => {
    // Degree level filter
    if (filters.degree && program.degree !== filters.degree) {
      return false;
    }
    
    // Field filter
    if (filters.field && program.field !== filters.field) {
      return false;
    }
    
    // Duration filter
    if (filters.duration && program.duration !== filters.duration) {
      return false;
    }
    
    // Fee range filter
    if (filters.feeRange) {
      const avgFee = average(program.fees.annual);
      if (avgFee < filters.feeRange.min || avgFee > filters.feeRange.max) {
        return false;
      }
    }
    
    // University filter
    if (filters.universities && filters.universities.length > 0) {
      if (!filters.universities.includes(program.universityId)) {
        return false;
      }
    }
    
    return true;
  });
}
```

## Key Technical Decisions

### 1. Data Storage: JSON Files
**Decision**: Use JSON files for all data instead of database
**Rationale**:
- Simple deployment (static hosting)
- Easy version control
- Fast client-side queries
- No backend required
- Easy to maintain and update

### 2. Client-Side Processing
**Decision**: All calculations happen in browser
**Rationale**:
- No server costs
- Works offline after initial load
- Instant responses
- No API delays
- Better privacy (no data sent to server)

### 3. Progressive Web App (PWA)
**Decision**: Build as PWA with service worker
**Rationale**:
- Installable on mobile home screen
- Works offline
- Fast loading with caching
- App-like experience
- No app store approval needed

### 4. React with Hooks
**Decision**: Use React with functional components and hooks
**Rationale**:
- Component reusability
- Clean, maintainable code
- Large ecosystem
- Good mobile performance
- Easy state management

### 5. Mobile-First CSS
**Decision**: Design for 320px first, then scale up
**Rationale**:
- Primary device is smartphone
- Ensures usability on smallest screens
- Progressive enhancement
- Better performance on mobile

## Component Relationships

```
App
├── Header
│   └── Logo, Navigation
├── SearchBar
│   ├── AutoComplete
│   └── FilterPanel
├── Routes
│   ├── Home
│   │   ├── QuickSearch
│   │   ├── PopularCourses
│   │   └── UniversityCards
│   ├── SearchResults
│   │   ├── ProgramCard[] 
│   │   └── FilterSidebar
│   ├── ProgramDetail
│   │   ├── Overview
│   │   ├── FeeBreakdown
│   │   ├── Calculator
│   │   └── ShareButton
│   ├── Comparison
│   │   ├── ComparisonTable
│   │   ├── VisualIndicators
│   │   └── CopyAllButton
│   └── UniversityProfile
│       ├── Rankings
│       ├── Facilities
│       ├── Placements
│       └── FAQs
└── Footer
```

## Critical Implementation Paths

### Path 1: Search to Share (Most Common)
1. User enters search query
2. System shows filtered results
3. User taps on program
4. System shows program details with fee calculator
5. User enters GPA
6. System calculates and displays breakdown
7. User taps "Copy"
8. System copies formatted text to clipboard
9. User shares on WhatsApp

### Path 2: Compare and Decide
1. User searches programs
2. User selects 2-3 programs for comparison
3. System shows side-by-side comparison
4. User enters GPA
5. System calculates costs for all programs
6. System highlights best options
7. User reviews rankings and highlights
8. User makes decision and shares one program

### Path 3: University Research
1. User taps on university card
2. System shows university profile
3. User reviews rankings, facilities, placements
4. User reads FAQs
5. User browses courses from that university
6. User proceeds to search/compare

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Load program details only when needed
2. **Virtual Scrolling**: For long lists (100+ programs)
3. **Memoization**: Cache search results and calculations
4. **Image Optimization**: WebP format, responsive images
5. **Code Splitting**: Load routes on demand
6. **Service Worker Caching**: Cache JSON data and assets

### Target Performance
- Initial load: < 3 seconds on 3G
- Search response: < 100ms
- Comparison render: < 200ms
- Offline load: < 500ms
