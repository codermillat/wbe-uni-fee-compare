import fs from 'fs';

// Read the current Sharda data
const shardaData = JSON.parse(fs.readFileSync('data/universities/sharda.json', 'utf8'));

// Function to determine scholarship category based on program
function getScholarshipCategory(program) {
    const degree = program.degree;
    const field = program.field;
    const specialization = program.specialization;
    
    // Category 1: B.Tech, BBA, MBA, BCA, MCA, B.Com, B.Arch, B.Design, BA Film/TV, LLB, BJMC, MJMC, M.Advertising, B.Sc. (Radiology, BMLT, CVT, Forensic, Optometry, Nutrition, Dialysis), M.Sc. (Clinical Research, Forensic, Nutrition)
    if (degree === 'B.Tech' || degree === 'B.Tech Lateral' || degree === 'M.Tech') return 'category1';
    if (degree === 'BBA' || degree === 'MBA') return 'category1';
    if (degree === 'BCA' || degree === 'MCA') return 'category1';
    if (degree === 'B.Arch') return 'category1';
    if (degree === 'LLB' || degree === 'BA LLB' || degree === 'BBA LLB' || degree === 'LLM') return 'category1';
    if (degree === 'BJMC' || degree === 'MJMC') return 'category1';
    
    // Special B.Sc. programs in Category 1
    if (degree === 'B.Sc.' && (
        specialization.includes('Radiology') || 
        specialization.includes('Medical Lab Technology') ||
        specialization.includes('Optometry') ||
        specialization.includes('Operation Theatre')
    )) return 'category1';
    
    // Category 2: B.Sc. Nursing
    if (degree === 'B.Sc.' && field === 'Nursing') return 'category2';
    if (degree === 'Diploma' && field === 'Nursing') return 'category2';
    
    // Category 4: Medical and Pharmacy programs  
    if (degree === 'MBBS' || degree === 'BDS') return 'category4';
    if (degree === 'B.Pharm' || degree === 'D.Pharm' || degree === 'M.Pharm') return 'category4';
    if (degree === 'BPT') return 'category4';
    if (degree === 'M.Sc.' && field === 'Nursing') return 'category4';
    
    // Category 3: Other B.Sc., B.A., M.Sc., M.A. programs
    if (degree === 'B.Sc.' || degree === 'M.Sc.') return 'category3';
    if (degree === 'BA' || degree === 'MA') return 'category3';
    if (degree === 'Ph.D.') return 'category3';
    
    // Default to category3
    return 'category3';
}

// Update all programs with scholarship categories
shardaData.programs = shardaData.programs.map(program => {
    return {
        ...program,
        scholarshipCategory: getScholarshipCategory(program)
    };
});

// Write the updated data back
fs.writeFileSync('data/universities/sharda.json', JSON.stringify(shardaData, null, 2));
console.log('Updated all programs with scholarship categories');
