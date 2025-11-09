// Comprehensive Course Mapping System for 100% Accurate Course Comparison
// This file contains all mapping logic for matching courses across universities

// Standardized Field Mapping - Simple and self-explanatory for counselors
const FIELD_MAPPING = {
  // Engineering programs
  'Engineering': 'Engineering',
  
  // Computer Science & IT programs
  'Computer Science': 'Computer Science & IT',
  'Computing': 'Computer Science & IT',
  
  // Basic Sciences (Physics, Chemistry, Mathematics, etc.)
  'Science': 'Basic Sciences',
  'Sciences': 'Basic Sciences',
  'Biotechnology': 'Basic Sciences',
  
  // Health Sciences (Nursing, Allied Health, etc.)
  'Allied Health Sciences': 'Health Sciences',
  'Health Sciences': 'Health Sciences',
  'Nursing': 'Health Sciences',
  
  // Medical Sciences (MBBS, BDS, etc.)
  'Medical Sciences': 'Medical Sciences',
  
  // Commerce & Business (B.Com, BBA, MBA, etc.)
  'Commerce': 'Commerce & Business',
  'Management': 'Commerce & Business',
  'Tourism & Hospitality': 'Commerce & Business',
  'Hospitality': 'Commerce & Business',
  
  // Design & Arts
  'Design': 'Design & Arts',
  'Fine Arts': 'Design & Arts',
  
  // Media & Communication
  'Media': 'Media & Communication',
  'Journalism': 'Media & Communication',
  
  // Arts & Humanities
  'Liberal Arts': 'Arts & Humanities',
  
  // Professional Programs
  'Law': 'Law',
  'Pharmacy': 'Pharmacy',
  'Architecture': 'Architecture',
  'Education': 'Education',
  'Agriculture': 'Agriculture',
  'Research': 'Research',
  'Certifications': 'Certifications'
};

// Normalize specialization for matching
function normalizeSpecialization(spec) {
  if (!spec) return '';
  
  const s = spec.toLowerCase().trim();
  
  // Remove common prefixes and suffixes
  let normalized = s
    .replace(/^(b\.?tech|b\.?e\.?|bachelor of|b\.?sc|b\.?a|bba|bcom|m\.?tech|m\.?e|mba|m\.?sc|m\.?a|mca|llb|llm|phd|pharm\.?d|b\.?arch|b\.?des|b\.?pharm|bpt|b\.?optom|mpt|m\.?pharm|m\.?arch|m\.?des|m\.?com|m\.?ed|b\.?ed|d\.?pharm|diploma in|certificate in|master of|doctor of)\s*/i, '')
    .replace(/\s*(engineering|science|technology|management|administration|commerce|arts|law|pharmacy|architecture|design|education|nursing|physiotherapy|optometry|applications|studies|program)$/i, '')
    .replace(/[()]/g, ' ') // Remove parentheses
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  return normalized;
}

// Specialization matching groups - groups similar specializations together
const SPECIALIZATION_GROUPS = {
  // B.Tech Core Programs
  'computer science engineering': [
    'computer science & engineering', 'computer science and engineering', 
    'computer science engineering', 'cse', 'computer science & eng'
  ],
  'mechanical engineering': [
    'mechanical engineering', 'me', 'mechanical eng'
  ],
  'civil engineering': [
    'civil engineering', 'ce', 'civil eng'
  ],
  'electronics communication engineering': [
    'electronics & communication engineering', 'electronics and communication engineering',
    'electronics communication engineering', 'ece', 'electronics & comm'
  ],
  'electrical engineering': [
    'electrical engineering', 'ee', 'electrical eng'
  ],
  'information technology': [
    'information technology', 'it'
  ],
  'biotechnology': [
    'biotechnology', 'biotech', 'bio technology'
  ],
  'chemical engineering': [
    'chemical engineering', 'che', 'chemical eng'
  ],
  'aerospace engineering': [
    'aerospace engineering', 'ae', 'aerospace eng'
  ],
  'automobile engineering': [
    'automobile engineering', 'ame', 'automobile eng', 'automotive engineering'
  ],
  'mechatronics engineering': [
    'mechatronics engineering', 'mechatronics'
  ],
  'food technology': [
    'food technology', 'ft', 'food tech'
  ],
  
  // B.Tech Specializations - CSE
  'artificial intelligence machine learning': [
    'artificial intelligence & machine learning', 'artificial intelligence and machine learning',
    'ai & ml', 'aiml', 'artificial intelligence', 'machine learning', 'ai/ml'
  ],
  'data science': [
    'data science', 'data science & analytics', 'data science and analytics',
    'data analytics', 'big data'
  ],
  'cyber security': [
    'cyber security', 'cybersecurity', 'cyber security & forensics',
    'cyber security and forensics', 'security'
  ],
  'cloud computing': [
    'cloud computing', 'cloud computing & virtualization', 'cloud technology',
    'cloud computing and virtualization'
  ],
  'full stack development': [
    'full stack development', 'full stack', 'fullstack development'
  ],
  'internet of things': [
    'internet of things', 'iot', 'iot applications', 'ai for iot applications'
  ],
  'blockchain technology': [
    'blockchain technology', 'blockchain', 'block chain technology'
  ],
  'augmented virtual reality': [
    'augmented & virtual reality', 'augmented and virtual reality',
    'ar/vr', 'arvr', 'augmented reality', 'virtual reality'
  ],
  
  // BBA
  'business administration': [
    'business administration', 'general management', 'bba general',
    'bba', 'business admin', 'management'
  ],
  'banking finance': [
    'banking & finance', 'banking and finance', 'banking finance',
    'financial management', 'finance'
  ],
  'marketing management': [
    'marketing management', 'marketing', 'marketing mgmt'
  ],
  'human resource management': [
    'human resource management', 'hrm', 'hr management', 'strategic hr',
    'human resources'
  ],
  'international business': [
    'international business', 'global business', 'international trade'
  ],
  'entrepreneurship': [
    'entrepreneurship', 'entrepreneurial studies'
  ],
  'supply chain management': [
    'supply chain management', 'logistics and supply chain management',
    'supply chain', 'logistics'
  ],
  'health care management': [
    'health care management', 'healthcare management', 'hospital management',
    'healthcare & hospital management'
  ],
  'business analytics': [
    'business analytics', 'analytics', 'data analytics'
  ],
  'digital marketing': [
    'digital marketing', 'marketing'
  ],
  
  // B.Com
  'commerce': [
    'commerce', 'general commerce', 'bcom', 'accounting', 'finance & accounting'
  ],
  'international accounting finance': [
    'international accounting & finance', 'international accounting and finance',
    'acca', 'accounting & finance'
  ],
  'financial markets': [
    'financial markets', 'capital markets', 'finance markets'
  ],
  
  // B.Sc Programs
  'computer science': [
    'computer science', 'cs', 'computer science (hons)'
  ],
  'physics': [
    'physics', 'applied physics'
  ],
  'chemistry': [
    'chemistry', 'applied chemistry', 'computational chemistry'
  ],
  'mathematics': [
    'mathematics', 'maths', 'applied mathematics'
  ],
  'biotechnology': [
    'biotechnology', 'biotech', 'bio technology'
  ],
  'microbiology': [
    'microbiology', 'applied microbiology'
  ],
  'zoology': [
    'zoology', 'animal science'
  ],
  'environmental science': [
    'environmental science', 'environmental studies'
  ],
  'forensic science': [
    'forensic science', 'forensics'
  ],
  'data science analytics': [
    'data science and analytics', 'data science', 'data analytics'
  ],
  
  // Health Sciences
  'nursing': [
    'nursing', 'b.sc nursing'
  ],
  'medical lab technology': [
    'medical lab technology', 'medical laboratory technology', 'bmlt',
    'laboratory technology'
  ],
  'radiology imaging': [
    'radiology & imaging technology', 'radiological imaging techniques',
    'medical radiology and imaging technology', 'bmrit', 'radiology'
  ],
  'cardiac care technology': [
    'cardiac care technology', 'cardiovascular technology', 'cvt'
  ],
  'operation theatre technology': [
    'operation theatre technology', 'ott', 'operation theater technology'
  ],
  'nutrition dietetics': [
    'nutrition & dietetics', 'nutrition and dietetics', 'clinical nutrition',
    'food science and dietetics'
  ],
  'physiotherapy': [
    'physiotherapy', 'physical therapy', 'bpt'
  ],
  'optometry': [
    'optometry', 'b.optom', 'bachelor of optometry'
  ],
  
  // BA Programs
  'english': [
    'english', 'english literature', 'english language'
  ],
  'psychology': [
    'psychology', 'applied psychology', 'clinical psychology'
  ],
  'economics': [
    'economics', 'applied economics'
  ],
  'sociology': [
    'sociology', 'social sciences'
  ],
  'political science': [
    'political science', 'politics', 'government'
  ],
  'history': [
    'history', 'modern history'
  ],
  'geography': [
    'geography', 'human geography'
  ],
  'international relations': [
    'international relations', 'international affairs', 'diplomacy'
  ],
  'liberal arts': [
    'liberal arts', 'arts', 'general arts'
  ],
  
  // Design Programs
  'fashion design': [
    'fashion design', 'fashion', 'apparel design'
  ],
  'interior design': [
    'interior design', 'interior', 'space design'
  ],
  'product design': [
    'product design', 'industrial design', 'product and industrial design'
  ],
  'communication design': [
    'communication design', 'graphic design', 'visual communication'
  ],
  'animation vfx': [
    'animation, vfx and gaming', 'animation & vfx', 'animation and vfx',
    'animation', 'vfx', 'gaming design'
  ],
  
  // Media & Communication
  'journalism mass communication': [
    'journalism & mass communication', 'journalism and mass communication',
    'journalism', 'mass communication', 'jbmc'
  ],
  'film television': [
    'film television & ott production', 'film production and theatre',
    'film & tv production', 'cinema', 'film production'
  ],
  
  // Law
  'law': [
    'law', 'legal studies', 'jurisprudence'
  ],
  
  // Architecture
  'architecture': [
    'architecture', 'b.arch', 'architectural studies'
  ],
  
  // Pharmacy
  'pharmacy': [
    'pharmacy', 'b.pharm', 'pharmaceutical sciences'
  ],
  
  // Education
  'education': [
    'education', 'b.ed', 'teaching', 'pedagogy'
  ]
};

// Check if two specializations match
function matchSpecializations(spec1, spec2) {
  const norm1 = normalizeSpecialization(spec1);
  const norm2 = normalizeSpecialization(spec2);
  
  // Exact match
  if (norm1 === norm2) return { match: true, score: 100, type: 'exact' };
  
  // Check if one contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return { match: true, score: 90, type: 'contains' };
  }
  
  // Check specialization groups
  for (const [group, variations] of Object.entries(SPECIALIZATION_GROUPS)) {
    const spec1InGroup = variations.some(v => norm1.includes(v) || v.includes(norm1));
    const spec2InGroup = variations.some(v => norm2.includes(v) || v.includes(norm2));
    
    if (spec1InGroup && spec2InGroup) {
      return { match: true, score: 85, type: 'group' };
    }
  }
  
  // Check for common significant words
  const words1 = norm1.split(/\s+/).filter(w => w.length > 3);
  const words2 = norm2.split(/\s+/).filter(w => w.length > 3);
  
  if (words1.length === 0 || words2.length === 0) {
    return { match: false, score: 0, type: 'no-match' };
  }
  
  const commonWords = words1.filter(w => words2.includes(w));
  if (commonWords.length === 0) {
    return { match: false, score: 0, type: 'no-match' };
  }
  
  const similarity = (commonWords.length / Math.max(words1.length, words2.length)) * 70;
  
  if (similarity >= 50) {
    return { match: true, score: similarity, type: 'partial' };
  }
  
  return { match: false, score: similarity, type: 'no-match' };
}

// Normalize degree type for matching
function normalizeDegree(degree) {
  const d = degree.toLowerCase().trim();
  
  // Map variations to standard forms
  const degreeMap = {
    'b.tech': 'B.Tech',
    'b.e.': 'B.Tech',
    'bachelor of engineering': 'B.Tech',
    'b.sc': 'B.Sc',
    'b.sc.': 'B.Sc',
    'bachelor of science': 'B.Sc',
    'b.sc (hons)': 'B.Sc',
    'b.sc (hons.)': 'B.Sc',
    'b.sc. (hons.)': 'B.Sc',
    'b.sc. (hons)': 'B.Sc',
    'b.sc (hons/research)': 'B.Sc',
    'b.sc. (hons./research)': 'B.Sc',
    'bba': 'BBA',
    'bachelor of business administration': 'BBA',
    'b.com': 'B.Com',
    'b.com.': 'B.Com',
    'bachelor of commerce': 'B.Com',
    'b.com (hons)': 'B.Com',
    'b.com (hons.)': 'B.Com',
    'b.com. (hons.)': 'B.Com',
    'ba': 'BA',
    'b.a': 'BA',
    'b.a.': 'BA',
    'bachelor of arts': 'BA',
    'bca': 'BCA',
    'bachelor of computer applications': 'BCA',
    'b.arch': 'B.Arch',
    'bachelor of architecture': 'B.Arch',
    'b.des': 'B.Des',
    'bachelor of design': 'B.Des',
    'b.pharm': 'B.Pharm',
    'bachelor of pharmacy': 'B.Pharm',
    'bpt': 'BPT',
    'bachelor of physiotherapy': 'BPT',
    'b.optom': 'B.Optom',
    'bachelor of optometry': 'B.Optom',
    'bjmc': 'BJMC',
    'bachelor of journalism': 'BJMC',
    'bballb': 'BBA LLB',
    'bba llb': 'BBA LLB',
    'ballb': 'BA LLB',
    'ba llb': 'BA LLB',
    'llb': 'LLB',
    'bachelor of law': 'LLB',
    'm.tech': 'M.Tech',
    'm.e.': 'M.Tech',
    'master of engineering': 'M.Tech',
    'm.sc': 'M.Sc',
    'm.sc.': 'M.Sc',
    'master of science': 'M.Sc',
    'mba': 'MBA',
    'master of business administration': 'MBA',
    'm.com': 'M.Com',
    'm.com.': 'M.Com',
    'master of commerce': 'M.Com',
    'ma': 'MA',
    'm.a': 'MA',
    'm.a.': 'MA',
    'master of arts': 'MA',
    'mca': 'MCA',
    'master of computer applications': 'MCA',
    'm.arch': 'M.Arch',
    'master of architecture': 'M.Arch',
    'm.des': 'M.Des',
    'master of design': 'M.Des',
    'm.pharm': 'M.Pharm',
    'master of pharmacy': 'M.Pharm',
    'mpt': 'MPT',
    'master of physiotherapy': 'MPT',
    'm.optom': 'M.Optom',
    'master of optometry': 'M.Optom',
    'llm': 'LLM',
    'master of law': 'LLM',
    'ph.d.': 'Ph.D.',
    'phd': 'Ph.D.',
    'doctor of philosophy': 'Ph.D.',
    'pharm.d': 'Pharm.D',
    'doctor of pharmacy': 'Pharm.D',
    'diploma': 'Diploma',
    'd.pharm': 'D.Pharm',
    'diploma in pharmacy': 'D.Pharm',
    'b.ed': 'B.Ed',
    'bachelor of education': 'B.Ed',
    'm.ed': 'M.Ed',
    'master of education': 'M.Ed',
    'bhm': 'BHM',
    'bachelor of hotel management': 'BHM',
    'bsc-hotel': 'BHM',
    'b.sc hotel management': 'BHM',
    'certificate': 'Certificate',
    'btech lateral': 'B.Tech Lateral',
    'b.sc lateral': 'B.Sc Lateral',
    'b.des lateral': 'B.Des Lateral',
    'bhm lateral': 'BHM Lateral',
    'b.optom lateral': 'B.Optom Lateral',
    'bpt lateral': 'BPT Lateral',
    'bmrit lateral': 'BMRIT Lateral'
  };
  
  return degreeMap[d] || degree;
}

// Check if two degrees match (accounting for variations)
function matchDegrees(degree1, degree2) {
  const norm1 = normalizeDegree(degree1);
  const norm2 = normalizeDegree(degree2);
  
  // Exact match after normalization
  if (norm1 === norm2) return true;
  
  // Special cases
  if ((norm1 === 'B.Tech' && norm2 === 'B.Tech') ||
      (norm1 === 'B.Sc' && norm2 === 'B.Sc') ||
      (norm1 === 'BBA' && norm2 === 'BBA') ||
      (norm1 === 'B.Com' && norm2 === 'B.Com') ||
      (norm1 === 'BA' && norm2 === 'BA') ||
      (norm1 === 'MBA' && norm2 === 'MBA') ||
      (norm1 === 'M.Tech' && norm2 === 'M.Tech') ||
      (norm1 === 'M.Sc' && norm2 === 'M.Sc') ||
      (norm1 === 'MA' && norm2 === 'MA') ||
      (norm1 === 'MCA' && norm2 === 'MCA')) {
    return true;
  }
  
  return false;
}

// Find best matching program
function findBestMatchingProgram(selectedProgram, candidatePrograms) {
  if (!candidatePrograms || candidatePrograms.length === 0) return null;
  
  // Filter by degree type and duration first
  const sameDegreeDuration = candidatePrograms.filter(p => {
    return matchDegrees(p.degree, selectedProgram.degree) && 
           p.duration === selectedProgram.duration;
  });
  
  if (sameDegreeDuration.length === 0) return null;
  
  // Try to find exact specialization match
  const exactMatch = sameDegreeDuration.find(p => {
    const match = matchSpecializations(p.specialization, selectedProgram.specialization);
    return match.match && match.score >= 90;
  });
  
  if (exactMatch) {
    return {
      program: exactMatch,
      quality: 'perfect',
      score: 100,
      reason: 'Perfect match: Same degree, duration, and specialization'
    };
  }
  
  // Try to find strong match (same degree, duration, similar specialization)
  let bestMatch = null;
  let bestScore = 0;
  
  sameDegreeDuration.forEach(p => {
    const match = matchSpecializations(p.specialization, selectedProgram.specialization);
    if (match.match && match.score > bestScore) {
      bestScore = match.score;
      bestMatch = p;
    }
  });
  
  if (bestMatch && bestScore >= 70) {
    return {
      program: bestMatch,
      quality: 'good',
      score: bestScore,
      reason: `Strong match: Same degree (${selectedProgram.degree}) and duration (${selectedProgram.duration} years) with similar specialization`
    };
  }
  
  if (bestMatch && bestScore >= 50) {
    return {
      program: bestMatch,
      quality: 'approximate',
      score: bestScore,
      reason: `Related match: Same degree (${selectedProgram.degree}) and duration (${selectedProgram.duration} years) but different specialization`
    };
  }
  
  // If no good match found, return null
  return null;
}

// Get standardized field name
function getStandardizedField(field) {
  return FIELD_MAPPING[field] || field;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FIELD_MAPPING,
    normalizeSpecialization,
    SPECIALIZATION_GROUPS,
    matchSpecializations,
    normalizeDegree,
    matchDegrees,
    findBestMatchingProgram,
    getStandardizedField
  };
}

