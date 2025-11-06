import { useState, useEffect } from 'react'
import niuData from '../data/universities/niu.json'
import shardaData from '../data/universities/sharda.json'
import chandigarhData from '../data/universities/chandigarh.json'

function App() {
  const [selectedDegree, setSelectedDegree] = useState('')
  const [selectedField, setSelectedField] = useState('')
  const [niuPrograms, setNiuPrograms] = useState([])
  const [shardaPrograms, setShardaPrograms] = useState([])
  const [chandigarhPrograms, setChandigarhPrograms] = useState([])
  const [comparisonData, setComparisonData] = useState(null)
  const [studentGPA, setStudentGPA] = useState('')
  const [studentName, setStudentName] = useState('')
  const [selectedNiuProgram, setSelectedNiuProgram] = useState(null)
  const [selectedShardaProgram, setSelectedShardaProgram] = useState(null)
  const [selectedChandigarhProgram, setSelectedChandigarhProgram] = useState(null)
  const [matchQuality, setMatchQuality] = useState(null)

  // All programs combined for filtering
  const allPrograms = [...niuData.programs, ...shardaData.programs, ...chandigarhData.programs]

  // Degree level mapping - map existing degree types to hierarchical categories
  const degreeLevelMapping = {
    'Diploma': ['Diploma'],
    'Bachelor': ['B.Tech', 'B.Sc.', 'BBA', 'B.Com', 'B.A.', 'B.Des', 'B.Arch', 'BFA', 'B.Ed'],
    'Bachelor (Lateral Entry)': ['B.Tech Lateral', 'B.Sc. Lateral', 'BBA Lateral'],
    'Masters': ['M.Tech', 'M.Sc.', 'MBA', 'M.Com', 'M.A.', 'M.Des', 'M.Arch', 'MFA', 'M.Ed'],
    'PhD': ['Ph.D.', 'PhD']
  }

  // Reverse mapping for quick lookup
  const degreeToLevelMap = {}
  Object.entries(degreeLevelMapping).forEach(([level, degrees]) => {
    degrees.forEach(degree => {
      degreeToLevelMap[degree] = level
    })
  })

  // Get degree level for a program
  const getDegreeLevel = (program) => {
    return degreeToLevelMap[program.degree] || 'Other'
  }

  // Hierarchical filter logic
  const getHierarchicalOptions = () => {
    // Fixed degree level options
    const degreeLevels = ['Diploma', 'Bachelor', 'Bachelor (Lateral Entry)', 'Masters', 'PhD']
    
    // Get available fields for selected degree level
    let availableFields = new Set()
    let filteredPrograms = allPrograms

    if (selectedDegree) {
      // Filter programs by degree level
      const levelPrograms = allPrograms.filter(p => getDegreeLevel(p) === selectedDegree)
      
      if (selectedField) {
        // Both level and field selected
        filteredPrograms = levelPrograms.filter(p => p.field === selectedField)
      } else {
        // Only level selected, show available fields
        filteredPrograms = levelPrograms
        levelPrograms.forEach(p => availableFields.add(p.field))
      }
    }

    return {
      degreeLevels,
      fields: Array.from(availableFields).sort(),
      programs: filteredPrograms
    }
  }

  const { degreeLevels, fields, programs: filteredPrograms } = getHierarchicalOptions()

  // Count programs by degree level and field for display
  const getHierarchicalCounts = () => {
    const degreeLevelCounts = {}
    const fieldCounts = {}

    // Count all programs by degree level
    allPrograms.forEach(program => {
      const level = getDegreeLevel(program)
      degreeLevelCounts[level] = (degreeLevelCounts[level] || 0) + 1
    })

    // Count fields for selected degree level
    if (selectedDegree) {
      const levelPrograms = allPrograms.filter(p => getDegreeLevel(p) === selectedDegree)
      levelPrograms.forEach(program => {
        fieldCounts[program.field] = (fieldCounts[program.field] || 0) + 1
      })
    }

    return { degreeLevelCounts, fieldCounts }
  }

  const { degreeLevelCounts, fieldCounts } = getHierarchicalCounts()

  // Filter programs based on hierarchical selection
  useEffect(() => {
    let niuFiltered = niuData.programs
    let shardaFiltered = shardaData.programs
    let chandigarhFiltered = chandigarhData.programs

    if (selectedDegree) {
      // Filter by degree level
      niuFiltered = niuFiltered.filter(p => getDegreeLevel(p) === selectedDegree)
      shardaFiltered = shardaFiltered.filter(p => getDegreeLevel(p) === selectedDegree)
      chandigarhFiltered = chandigarhFiltered.filter(p => getDegreeLevel(p) === selectedDegree)
    }

    if (selectedField) {
      // Filter by field
      niuFiltered = niuFiltered.filter(p => p.field === selectedField)
      shardaFiltered = shardaFiltered.filter(p => p.field === selectedField)
      chandigarhFiltered = chandigarhFiltered.filter(p => p.field === selectedField)
    }

    setNiuPrograms(niuFiltered)
    setShardaPrograms(shardaFiltered)
    setChandigarhPrograms(chandigarhFiltered)
  }, [selectedDegree, selectedField])

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedDegree('')
    setSelectedField('')
  }

  // Get active filter count
  const activeFilterCount = (selectedDegree ? 1 : 0) + (selectedField ? 1 : 0)

  // Enhanced smart program matching algorithm with stricter criteria
  const findBestMatch = (selectedProgram, candidatePrograms, universityName) => {
    if (!candidatePrograms || candidatePrograms.length === 0) return null

    // Helper function to calculate specialization similarity score
    const getSpecializationSimilarity = (spec1, spec2) => {
      const normalize = (str) => str.toLowerCase().trim()
      const s1 = normalize(spec1)
      const s2 = normalize(spec2)
      
      // Exact match
      if (s1 === s2) return 100
      
      // Check if one contains the other
      if (s1.includes(s2) || s2.includes(s1)) return 80
      
      // Check for common key words (excluding generic words)
      const genericWords = ['engineering', 'science', 'technology', 'management', 'studies', 'and', 'with', 'in']
      const words1 = s1.split(/[\s,&()]+/).filter(w => w.length > 3 && !genericWords.includes(w))
      const words2 = s2.split(/[\s,&()]+/).filter(w => w.length > 3 && !genericWords.includes(w))
      
      if (words1.length === 0 || words2.length === 0) return 0
      
      const commonWords = words1.filter(w => words2.includes(w))
      if (commonWords.length === 0) return 0
      
      // Calculate similarity based on common significant words
      const similarity = (commonWords.length / Math.max(words1.length, words2.length)) * 60
      return similarity
    }

    // Priority 1: Perfect match (exact degree + exact specialization)
    let match = candidatePrograms.find(
      p => p.degree === selectedProgram.degree && 
           p.specialization.toLowerCase() === selectedProgram.specialization.toLowerCase()
    )
    if (match) {
      return { 
        program: match, 
        quality: 'perfect', 
        reason: 'Perfect match: Same degree and exact specialization'
      }
    }

    // Priority 2: Strong match (same degree + highly similar specialization)
    let bestMatch = null
    let bestScore = 0
    
    candidatePrograms.forEach(p => {
      if (p.degree === selectedProgram.degree) {
        const similarity = getSpecializationSimilarity(p.specialization, selectedProgram.specialization)
        if (similarity > bestScore) {
          bestScore = similarity
          bestMatch = p
        }
      }
    })

    // If we found a match with 60%+ similarity, return it as "good"
    if (bestMatch && bestScore >= 60) {
      return { 
        program: bestMatch, 
        quality: 'good', 
        reason: `Strong match: Same degree (${selectedProgram.degree}) with similar specialization`
      }
    }

    // If we found a match with 30-59% similarity, return it as "approximate"
    if (bestMatch && bestScore >= 30) {
      return { 
        program: bestMatch, 
        quality: 'approximate', 
        reason: `Related programs: Both ${selectedProgram.degree} but different specializations (${selectedProgram.specialization} vs ${bestMatch.specialization})`
      }
    }

    // No match found with sufficient similarity (< 30%)
    // Return null to trigger "No Match Available" message
    return null
  }

  // Enhanced program comparison with smart matching (Three Universities)
  const handleProgramSelection = (selectedProgram, fromUniversity) => {
    if (fromUniversity === 'niu') {
      setSelectedNiuProgram(selectedProgram)
      
      // Find matches in Sharda and Chandigarh
      const shardaMatch = shardaPrograms.length > 0 ? findBestMatch(selectedProgram, shardaPrograms, 'sharda') : null
      const chandigarhMatch = chandigarhPrograms.length > 0 ? findBestMatch(selectedProgram, chandigarhPrograms, 'chandigarh') : null
      
      setSelectedShardaProgram(shardaMatch?.program || null)
      setSelectedChandigarhProgram(chandigarhMatch?.program || null)
      
      // Set match quality based on best available match
      if (shardaMatch || chandigarhMatch) {
        const bestMatch = shardaMatch?.quality === 'perfect' ? shardaMatch : 
                         chandigarhMatch?.quality === 'perfect' ? chandigarhMatch :
                         shardaMatch?.quality === 'good' ? shardaMatch :
                         chandigarhMatch?.quality === 'good' ? chandigarhMatch :
                         shardaMatch || chandigarhMatch
        setMatchQuality(bestMatch)
      } else {
        setMatchQuality({
          quality: 'no-match',
          reason: `No comparable programs found at other universities for ${selectedProgram.name}`
        })
      }
      
      comparePrograms(selectedProgram, shardaMatch?.program || null, chandigarhMatch?.program || null)
      
    } else if (fromUniversity === 'sharda') {
      setSelectedShardaProgram(selectedProgram)
      
      // Find matches in NIU and Chandigarh
      const niuMatch = niuPrograms.length > 0 ? findBestMatch(selectedProgram, niuPrograms, 'niu') : null
      const chandigarhMatch = chandigarhPrograms.length > 0 ? findBestMatch(selectedProgram, chandigarhPrograms, 'chandigarh') : null
      
      setSelectedNiuProgram(niuMatch?.program || null)
      setSelectedChandigarhProgram(chandigarhMatch?.program || null)
      
      // Set match quality
      if (niuMatch || chandigarhMatch) {
        const bestMatch = niuMatch?.quality === 'perfect' ? niuMatch : 
                         chandigarhMatch?.quality === 'perfect' ? chandigarhMatch :
                         niuMatch?.quality === 'good' ? niuMatch :
                         chandigarhMatch?.quality === 'good' ? chandigarhMatch :
                         niuMatch || chandigarhMatch
        setMatchQuality(bestMatch)
      } else {
        setMatchQuality({
          quality: 'no-match',
          reason: `No comparable programs found at other universities for ${selectedProgram.name}`
        })
      }
      
      comparePrograms(niuMatch?.program || null, selectedProgram, chandigarhMatch?.program || null)
      
    } else {
      // fromUniversity === 'chandigarh'
      setSelectedChandigarhProgram(selectedProgram)
      
      // Find matches in NIU and Sharda
      const niuMatch = niuPrograms.length > 0 ? findBestMatch(selectedProgram, niuPrograms, 'niu') : null
      const shardaMatch = shardaPrograms.length > 0 ? findBestMatch(selectedProgram, shardaPrograms, 'sharda') : null
      
      setSelectedNiuProgram(niuMatch?.program || null)
      setSelectedShardaProgram(shardaMatch?.program || null)
      
      // Set match quality
      if (niuMatch || shardaMatch) {
        const bestMatch = niuMatch?.quality === 'perfect' ? niuMatch : 
                         shardaMatch?.quality === 'perfect' ? shardaMatch :
                         niuMatch?.quality === 'good' ? niuMatch :
                         shardaMatch?.quality === 'good' ? shardaMatch :
                         niuMatch || shardaMatch
        setMatchQuality(bestMatch)
      } else {
        setMatchQuality({
          quality: 'no-match',
          reason: `No comparable programs found at other universities for ${selectedProgram.name}`
        })
      }
      
      comparePrograms(niuMatch?.program || null, shardaMatch?.program || null, selectedProgram)
    }
  }

  // Get match quality badge styling
  const getMatchQualityBadge = (quality) => {
    switch (quality) {
      case 'perfect':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: '🎯', label: 'Perfect Match' }
      case 'good':
        return { bg: 'bg-blue-100', text: 'text-blue-800', icon: '✅', label: 'Good Match' }
      case 'approximate':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⚠️', label: 'Approximate Match' }
      case 'poor':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: '❌', label: 'Poor Match' }
      case 'no-match':
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: '🚫', label: 'No Match Available' }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: '❓', label: 'Unknown' }
    }
  }

  const calculateFees = (program, university) => {
    const totalAnnualFees = program.annualFees.reduce((sum, fee) => sum + fee, 0)
    const oneTimeFee = university.additionalFees.oneTime.amount
    const wbeComprehensiveFee = university.additionalFees.wbeAdditionalFees?.amount || oneTimeFee

    // Calculate additional recurring fees for Sharda
    const additionalFees = {
      oneTime: oneTimeFee,
      recurring: 0,
      wbeComprehensive: wbeComprehensiveFee,
      wbeRecurring: 0
    }

    if (university.id === 'sharda') {
      // Calculate standard recurring fees over program duration
      if (university.additionalFees.recurring) {
        const examFee = university.additionalFees.recurring.examination.amount * program.duration // Annual
        const regFee = university.additionalFees.recurring.registration.amount * (program.duration - 1) // From 2nd year
        const medicalFee = university.additionalFees.recurring.medical.amount * (program.duration - 1) // From 2nd year (reduced rate)
        const alumniFee = university.additionalFees.recurring.alumni.amount // Final year
        additionalFees.recurring = examFee + regFee + medicalFee + alumniFee
      }

      // Calculate WBE recurring fees using new structure
      if (university.additionalFees.wbeRecurring) {
        const wbeAnnualFee = university.additionalFees.wbeRecurring.totalAnnual
        additionalFees.wbeRecurring = wbeAnnualFee * (program.duration - 1) // From 2nd year onwards
      }
    }

    const totalAdditionalFees = additionalFees.oneTime + additionalFees.recurring
    const totalWBEFees = wbeComprehensiveFee + additionalFees.wbeRecurring

    // Calculate with category-based scholarship tiers for Sharda
    if (university.id === 'sharda') {
      // Get the program's scholarship category
      const scholarshipCategory = program.scholarshipCategory
      const category = university.scholarships.bangladeshStudents.categories[scholarshipCategory]
      
      if (!category || !category.tiers || category.tiers.length === 0) {
        // No scholarships available for this category (like category4 - medical/pharmacy)
        return { 
          tiers: [], 
          oneTimeFee, 
          additionalFees,
          originalTotal: totalAnnualFees + totalAdditionalFees,
          noScholarship: true,
          categoryName: category?.name || 'No Category',
          wbeEnhanced: null
        }
      }

      // Calculate standard scholarship tiers
      const tiers = category.tiers.map(tier => {
        const discountedAnnual = program.annualFees.map(fee => fee * (1 - (tier.percentage / 100)))
        const totalDiscounted = discountedAnnual.reduce((sum, fee) => sum + fee, 0)
        return {
          name: tier.name,
          percentage: tier.percentage,
          gpaRange: `${tier.gpaMin} - ${tier.gpaMax}`,
          gpaMin: tier.gpaMin,
          gpaMax: tier.gpaMax,
          conditions: tier.conditions,
          yearlyFees: discountedAnnual,
          totalFees: totalDiscounted + totalAdditionalFees,
          savings: totalAnnualFees - totalDiscounted,
          type: 'standard'
        }
      })

      // Calculate WBE enhanced scholarship tiers if available
      let wbeEnhancedTiers = []
      if (category.wbeEnhanced && category.wbeEnhanced.tiers) {
        wbeEnhancedTiers = category.wbeEnhanced.tiers.map(tier => {
          const discountedAnnual = program.annualFees.map(fee => fee * (1 - (tier.percentage / 100)))
          const totalDiscounted = discountedAnnual.reduce((sum, fee) => sum + fee, 0)
          const wbeTotal = totalDiscounted + wbeComprehensiveFee + additionalFees.wbeRecurring
          return {
            name: tier.name,
            percentage: tier.percentage,
            gpaRange: `${tier.gpaMin} - ${tier.gpaMax}`,
            gpaMin: tier.gpaMin,
            gpaMax: tier.gpaMax,
            conditions: tier.conditions,
            yearlyFees: discountedAnnual,
            totalFees: wbeTotal,
            savings: totalAnnualFees - totalDiscounted,
            type: 'wbeEnhanced',
            wbeAdvantages: university.additionalFees.wbeAdditionalFees?.wbeServices || []
          }
        })
      }

      return { 
        tiers, 
        wbeEnhanced: wbeEnhancedTiers,
        oneTimeFee, 
        additionalFees,
        originalTotal: totalAnnualFees + totalAdditionalFees,
        categoryName: category.name,
        categoryDescription: category.description,
        wbeEnhancedInfo: category.wbeEnhanced
      }
    }

    // Chandigarh has GPA-tiered scholarships
    if (university.id === 'chandigarh') {
      const tiers = university.scholarships.bangladeshStudents.tiers.map(tier => {
        const discountedAnnual = program.annualFees.map(fee => fee * (1 - (tier.percentage / 100)))
        const totalDiscounted = discountedAnnual.reduce((sum, fee) => sum + fee, 0)
        return {
          name: tier.name,
          percentage: tier.percentage,
          gpaRange: `${tier.gpaMin} - ${tier.gpaMax}`,
          gpaMin: tier.gpaMin,
          gpaMax: tier.gpaMax,
          conditions: tier.conditions,
          yearlyFees: discountedAnnual,
          totalFees: totalDiscounted + totalAdditionalFees,
          savings: totalAnnualFees - totalDiscounted,
          type: 'gpa-tiered'
        }
      })

      return {
        tiers,
        oneTimeFee,
        additionalFees,
        originalTotal: totalAnnualFees + totalAdditionalFees,
        scholarshipType: 'gpa-tiered'
      }
    }

    // NIU has flat 50% for all
    const discountPercentage = university.scholarships.bangladeshStudents.percentage
    const discountedAnnual = program.annualFees.map(fee => fee * (1 - (discountPercentage / 100)))
    const totalDiscounted = discountedAnnual.reduce((sum, fee) => sum + fee, 0)

    return {
      flat: {
        percentage: discountPercentage,
        yearlyFees: discountedAnnual,
        totalFees: totalDiscounted + totalAdditionalFees,
        savings: totalAnnualFees - totalDiscounted
      },
      oneTimeFee,
      additionalFees,
      originalTotal: totalAnnualFees + totalAdditionalFees
    }
  }

  const comparePrograms = (niuProgram, shardaProgram, chandigarhProgram) => {
    const niuCalc = niuProgram ? calculateFees(niuProgram, niuData) : null
    const shardaCalc = shardaProgram ? calculateFees(shardaProgram, shardaData) : null
    const chandigarhCalc = chandigarhProgram ? calculateFees(chandigarhProgram, chandigarhData) : null

    setComparisonData({
      niu: niuProgram ? {
        program: niuProgram,
        university: niuData,
        calculations: niuCalc
      } : null,
      sharda: shardaProgram ? {
        program: shardaProgram,
        university: shardaData,
        calculations: shardaCalc
      } : null,
      chandigarh: chandigarhProgram ? {
        program: chandigarhProgram,
        university: chandigarhData,
        calculations: chandigarhCalc
      } : null
    })
  }

  // Filter Sharda scholarships based on student GPA
  const getEligibleShardaScholarships = (calculations, type = 'standard') => {
    const tiersToCheck = type === 'wbeEnhanced' ? calculations.wbeEnhanced : calculations.tiers
    if (!studentGPA || !tiersToCheck) return tiersToCheck || []

    const gpa = parseFloat(studentGPA)
    if (isNaN(gpa)) return tiersToCheck || []

    return tiersToCheck.filter(tier => 
      gpa >= tier.gpaMin && gpa <= tier.gpaMax
    )
  }

  // Filter Chandigarh scholarships based on student GPA
  const getEligibleChandigarhScholarships = (calculations) => {
    if (!studentGPA || !calculations.tiers) return calculations.tiers || []

    const gpa = parseFloat(studentGPA)
    if (isNaN(gpa)) return calculations.tiers || []

    return calculations.tiers.filter(tier => 
      gpa >= tier.gpaMin && gpa <= tier.gpaMax
    )
  }

  // Get the best WBE enhanced scholarship for a student
  const getBestWBEScholarship = (calculations) => {
    if (!calculations.wbeEnhanced || calculations.wbeEnhanced.length === 0) return null
    
    const eligibleWBE = getEligibleShardaScholarships(calculations, 'wbeEnhanced')
    return eligibleWBE.length > 0 ? eligibleWBE[0] : null // Return best (first) eligible WBE option
  }

  // Clear all student data for new consultation
  const clearStudentData = () => {
    setStudentGPA('')
    setStudentName('')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Copy NIU details only - Professional message for students
  const copyNIUDetails = async () => {
    if (!comparisonData) return

    const studentGreeting = studentName ? `Dear ${studentName},\n\n` : ''
    
    const niuYearlyBreakdown = comparisonData.niu.calculations.flat.yearlyFees
      .map((fee, index) => `Year ${index + 1}: ${formatCurrency(fee)}`)
      .join('\n')

    const text = `${studentGreeting}🎓 EXCELLENT NEWS ABOUT YOUR ADMISSION TO NIU! 🇮🇳

I'm pleased to share the detailed fee structure for your ${comparisonData.niu.program.name} program at Noida International University.

📚 PROGRAM DETAILS:
✅ Program: ${comparisonData.niu.program.name}
✅ Duration: ${comparisonData.niu.program.duration} years
✅ Location: Greater Noida (1 hour from Delhi Airport)
✅ Recognition: NAAC A+ Rated University

💰 TOTAL INVESTMENT:
${niuYearlyBreakdown}
One-Time Fee (First Year): ${formatCurrency(comparisonData.niu.calculations.oneTimeFee)}

🎉 BANGLADESHI STUDENT SCHOLARSHIP: 50% GUARANTEED!
💸 Total After Scholarship: ${formatCurrency(comparisonData.niu.calculations.flat.totalFees)}
💵 You Save: ${formatCurrency(comparisonData.niu.calculations.flat.savings)}

🌟 KEY ADVANTAGES:
${comparisonData.niu.program.highlights.map(h => `✓ ${h}`).join('\n')}

🏠 WHAT'S INCLUDED IN ONE-TIME FEE:
✓ Registration & Admission Processing
✓ Visa Support Documentation
✓ Airport Pickup Service
✓ FRRO Registration Assistance
✓ Student ID & Library Access

This is an exceptional opportunity with guaranteed scholarship for Bangladeshi students. The program offers excellent career prospects and industry connections.

📞 Ready to proceed with your admission? Contact us for the next steps!

Best regards,
WBE Education Consultancy`.trim()

    try {
      await navigator.clipboard.writeText(text)
      alert('🎉 NIU details copied! Perfect for sharing with your student.')
    } catch (err) {
      alert('❌ Failed to copy. Please try again.')
    }
  }

  // Copy Sharda details only - Professional message for students
  const copyShardaDetails = async () => {
    if (!comparisonData) return

    const studentGreeting = studentName ? `Dear ${studentName},\n\n` : ''
    const eligibleScholarships = getEligibleShardaScholarships(comparisonData.sharda.calculations)

    let scholarshipText = ''
    if (comparisonData.sharda.calculations.noScholarship) {
      scholarshipText = `📚 PROGRAM INVESTMENT:
This is a premium program with no scholarships available.
Total Program Cost: ${formatCurrency(comparisonData.sharda.calculations.originalTotal)}

🏆 PROGRAM VALUE:
Despite the premium pricing, this program offers exceptional career opportunities and industry recognition.`
    } else if (eligibleScholarships.length === 1) {
      const tier = eligibleScholarships[0]
      const yearlyBreakdown = tier.yearlyFees
        .map((fee, index) => `Year ${index + 1}: ${formatCurrency(fee)}`)
        .join('\n')
      
      scholarshipText = `🎉 SCHOLARSHIP CONFIRMED: ${tier.percentage}% DISCOUNT!
Based on your academic performance (GPA ${studentGPA}), you qualify for our ${tier.name}.

💰 YOUR PROGRAM FEES:
${yearlyBreakdown}
One-Time Fee: ${formatCurrency(comparisonData.sharda.calculations.oneTimeFee)}

💸 Total After Scholarship: ${formatCurrency(tier.totalFees)}
💵 You Save: ${formatCurrency(tier.savings)}`
    } else if (eligibleScholarships.length > 1) {
      const bestTier = eligibleScholarships[0] // Assuming first tier is the best
      scholarshipText = `🎉 MULTIPLE SCHOLARSHIPS AVAILABLE!
Based on your GPA ${studentGPA}, you qualify for up to ${bestTier.percentage}% scholarship.

💰 BEST OPTION - ${bestTier.name}:
Total After ${bestTier.percentage}% Scholarship: ${formatCurrency(bestTier.totalFees)}
💵 You Save: ${formatCurrency(bestTier.savings)}`
    } else {
      scholarshipText = `📚 PROGRAM INVESTMENT:
Please contact us to discuss scholarship opportunities based on your academic profile.`
    }

    const text = `${studentGreeting}🌟 OUTSTANDING OPPORTUNITY AT SHARDA UNIVERSITY! 🇮🇳

I'm excited to present the details for your ${comparisonData.sharda.program.name} program at Sharda University.

📚 PROGRAM OVERVIEW:
✅ Program: ${comparisonData.sharda.program.name}
✅ Duration: ${comparisonData.sharda.program.duration} years  
✅ Location: Greater Noida (International Campus)
✅ Recognition: NAAC A Grade | Students from 95+ Countries

${scholarshipText}

🌟 PROGRAM HIGHLIGHTS:
${comparisonData.sharda.program.highlights.map(h => `✓ ${h}`).join('\n')}

🏠 COMPREHENSIVE SUPPORT SERVICES:
✓ Admission Processing & Documentation
✓ Visa Support & Airport Reception  
✓ FRRO Registration Assistance
✓ International Student Community
✓ Modern Campus Infrastructure

Sharda University offers an exceptional international education experience with strong industry connections and global recognition.

📞 Interested to secure your admission? Let's discuss the application process!

Best regards,
WBE Education Consultancy`.trim()

    try {
      await navigator.clipboard.writeText(text)
      alert('🎉 Sharda details copied! Perfect for sharing with your student.')
    } catch (err) {
      alert('❌ Failed to copy. Please try again.')
    }
  }

  // Smart Sharda Details - Automatically chooses best message (standard or WBE enhanced)
  const copySmartShardaDetails = async () => {
    if (!comparisonData) return

    const studentGreeting = studentName ? `Dear ${studentName},\n\n` : ''
    const eligibleScholarships = getEligibleShardaScholarships(comparisonData.sharda.calculations)
    const bestWBEScholarship = getBestWBEScholarship(comparisonData.sharda.calculations)
    
    // Check if WBE Enhanced provides genuine benefit
    const shouldShowWBEEnhanced = bestWBEScholarship && eligibleScholarships.length > 0 && 
      bestWBEScholarship.totalFees < eligibleScholarships[0].totalFees

    if (shouldShowWBEEnhanced) {
      // WBE Enhanced message with corrected fee explanation
      const wbeYearlyBreakdown = bestWBEScholarship.yearlyFees
        .map((fee, index) => `Year ${index + 1}: ${formatCurrency(fee)} (Tuition after ${bestWBEScholarship.percentage}% scholarship)`)
        .join('\n')

      // WBE Enhanced Fee Structure
      const wbeAnnualFeeAmount = (comparisonData.sharda.calculations.additionalFees.wbeRecurring / (comparisonData.sharda.program.duration - 1))
      const wbeAdditionalFees = `Year 1: ${formatCurrency(comparisonData.sharda.calculations.additionalFees.wbeComprehensive)} (WBE Comprehensive Package)
Year 2-${comparisonData.sharda.program.duration}: ${formatCurrency(wbeAnnualFeeAmount)} per year (WBE Annual Fee)`

      const wbePackageBreakdown = `
🎯 WBE COMPREHENSIVE PACKAGE (Year 1 Total: ${formatCurrency(comparisonData.sharda.calculations.additionalFees.wbeComprehensive)}):
This all-inclusive package includes:
✓ University Admission Processing: ₹30,000
✓ Medical Check-up & Insurance: ₹10,000 (₹5,000 from Year 2)
✓ Registration Fee: ₹15,000 (Annual from Year 2)
✓ Examination Fee: ₹12,000 (Annual)

📊 WBE ANNUAL FEES (Years 2-${comparisonData.sharda.program.duration}: ₹32,000 per year):
✓ Medical Check-up & Insurance: ₹5,000 per year
✓ Registration Fee: ₹15,000 per year
✓ Examination Fee: ₹12,000 per year`

      const savings = eligibleScholarships[0].totalFees - bestWBEScholarship.totalFees

      const text = `${studentGreeting}🚀 EXCLUSIVE WBE PARTNERSHIP BENEFITS - SHARDA UNIVERSITY! 🇮🇳

${studentName ? `${studentName}, ` : ''}I have excellent news about your Sharda University admission through our exclusive WBE partnership!

📚 PROGRAM DETAILS:
✅ Program: ${comparisonData.sharda.program.name}
✅ Duration: ${comparisonData.sharda.program.duration} years
✅ Location: Greater Noida (International Campus)
✅ Recognition: NAAC A Grade | Students from 95+ Countries

🌟 YOUR WBE ENHANCED BENEFITS:
Standard Application: ${eligibleScholarships[0].percentage}% scholarship (${formatCurrency(eligibleScholarships[0].totalFees)})
Through WBE Partnership: ${bestWBEScholarship.percentage}% scholarship (${formatCurrency(bestWBEScholarship.totalFees)})
📈 Additional WBE Savings: ${formatCurrency(savings)}

💰 DETAILED FEE BREAKDOWN (WBE ENHANCED):

📚 TUITION FEES (After ${bestWBEScholarship.percentage}% WBE Scholarship):
${wbeYearlyBreakdown}

🏫 WBE ADDITIONAL FEES:
${wbeAdditionalFees}
${wbePackageBreakdown}

🎯 TOTAL PROGRAM INVESTMENT: ${formatCurrency(bestWBEScholarship.totalFees)}
💸 Your Academic Savings: ${formatCurrency(bestWBEScholarship.savings)}

🏆 FREE WBE PARTNERSHIP SERVICES (Others charge for these):
✓ FREE Visa Slot Arrangement (Save 12,000-20,000 BDT)
✓ FREE Premium Documentation Support
✓ FREE Airport Reception & FRRO Registration
✓ FREE Accommodation Assistance
✓ FREE 24/7 Student Support Helpline
✓ Priority University Processing

💡 *All fees above are paid directly to Sharda University. WBE provides ALL services completely FREE!

🌟 PROGRAM HIGHLIGHTS:
${comparisonData.sharda.program.highlights.map(h => `✓ ${h}`).join('\n')}

⚡ WHY CHOOSE WBE?
Other consultancies charge 15,000-25,000 BDT for basic services. WBE provides premium support completely FREE through our exclusive university partnership!

📞 Ready to secure your enhanced admission with FREE premium services? Contact us now!

Best regards,
WBE Education Consultancy

*All WBE services are provided FREE. You only pay university fees directly to Sharda.`.trim()

      try {
        await navigator.clipboard.writeText(text)
        alert('🎉 WBE Enhanced Sharda details copied! Clear messaging about FREE services.')
      } catch (err) {
        alert('❌ Failed to copy. Please try again.')
      }
    } else {
      // Standard Sharda message when WBE Enhanced doesn't provide better scholarship
      let scholarshipText = ''
      if (comparisonData.sharda.calculations.noScholarship) {
        scholarshipText = `📚 PROGRAM INVESTMENT:
This is a premium program with no scholarships available.
Total Program Cost: ${formatCurrency(comparisonData.sharda.calculations.originalTotal)}

🏆 WBE VALUE-ADDED SERVICES (FREE):
✓ FREE Visa Slot Arrangement (Save 12,000-20,000 BDT)
✓ FREE Complete Documentation Support
✓ FREE Airport Reception & Assistance
✓ FREE Accommodation Guidance`
      } else if (eligibleScholarships.length === 1) {
        const tier = eligibleScholarships[0]
        const yearlyBreakdown = tier.yearlyFees
          .map((fee, index) => `Year ${index + 1}: ${formatCurrency(fee)}`)
          .join('\n')
        
        scholarshipText = `🎉 SCHOLARSHIP CONFIRMED: ${tier.percentage}% DISCOUNT!
Based on your academic performance (GPA ${studentGPA}), you qualify for ${tier.name}.

💰 YOUR PROGRAM FEES:
${yearlyBreakdown}
University Admission Fee: ${formatCurrency(comparisonData.sharda.calculations.oneTimeFee)}

💸 Total Program Cost: ${formatCurrency(tier.totalFees)}
💵 Academic Savings: ${formatCurrency(tier.savings)}

🏆 BONUS: FREE WBE SERVICES (Others charge 15K-25K BDT):
✓ FREE Visa Slot Arrangement (Save 12,000-20,000 BDT)
✓ FREE Premium Documentation Support
✓ FREE Airport Reception & FRRO Registration
✓ FREE Accommodation Assistance`
      } else {
        scholarshipText = `📚 SCHOLARSHIP OPPORTUNITIES:
Multiple scholarship tiers available based on your academic profile.
Contact us for personalized scholarship assessment.

🏆 FREE WBE SERVICES (Others charge for these):
✓ FREE Visa Slot Arrangement (Save 12,000-20,000 BDT)
✓ FREE Complete Documentation Support
✓ FREE Premium Student Services`
      }

      const text = `${studentGreeting}🌟 OUTSTANDING OPPORTUNITY AT SHARDA UNIVERSITY! 🇮🇳

I'm excited to present your ${comparisonData.sharda.program.name} program details at Sharda University.

📚 PROGRAM OVERVIEW:
✅ Program: ${comparisonData.sharda.program.name}
✅ Duration: ${comparisonData.sharda.program.duration} years  
✅ Location: Greater Noida (International Campus)
✅ Recognition: NAAC A Grade | Students from 95+ Countries

${scholarshipText}

🌟 PROGRAM HIGHLIGHTS:
${comparisonData.sharda.program.highlights.map(h => `✓ ${h}`).join('\n')}

💡 WBE ADVANTAGE: While others charge consultation fees, we provide all premium services FREE through our exclusive university partnerships!

📞 Ready to secure your admission with FREE premium support? Let's start your application!

Best regards,
WBE Education Consultancy`.trim()

      try {
        await navigator.clipboard.writeText(text)
        alert('🎉 Sharda details copied! Emphasizing FREE WBE services.')
      } catch (err) {
        alert('❌ Failed to copy. Please try again.')
      }
    }
  }

  // Smart Full Comparison - Budget-aware recommendation with WBE advantages
  const copySmartComparison = async () => {
    if (!comparisonData) return

    const studentGreeting = studentName ? `Dear ${studentName},\n\n` : ''
    const eligibleShardaScholarships = getEligibleShardaScholarships(comparisonData.sharda.calculations)
    const bestWBEScholarship = getBestWBEScholarship(comparisonData.sharda.calculations)
    
    // Determine best option based on budget and profile
    const niuTotal = comparisonData.niu.calculations.flat.totalFees
    const shardaTotal = eligibleShardaScholarships.length > 0 ? eligibleShardaScholarships[0].totalFees : comparisonData.sharda.calculations.originalTotal
    const wbeTotal = bestWBEScholarship ? bestWBEScholarship.totalFees : shardaTotal

    // Calculate budget differences
    const shardaVsNiu = shardaTotal - niuTotal
    const wbeVsNiu = wbeTotal - niuTotal
    
    let recommendation = ''
    let budgetAnalysis = ''
    
    // Smart budget-based recommendation
    if (niuTotal < shardaTotal && niuTotal < wbeTotal) {
      recommendation = '🏆 BUDGET RECOMMENDATION: NIU'
      budgetAnalysis = `💰 BEST VALUE FOR MONEY: NIU saves you ${formatCurrency(Math.min(shardaVsNiu, wbeVsNiu))} compared to Sharda options.`
    } else if (wbeTotal <= shardaTotal && bestWBEScholarship) {
      recommendation = '🚀 PREMIUM RECOMMENDATION: Sharda via WBE Partnership'
      budgetAnalysis = `💎 BEST OVERALL VALUE: WBE Partnership provides premium services FREE plus ${bestWBEScholarship.percentage}% scholarship.`
    } else if (eligibleShardaScholarships.length > 0) {
      recommendation = '🎓 QUALITY RECOMMENDATION: Sharda University'
      budgetAnalysis = `🌟 PREMIUM EDUCATION: Higher investment but international campus experience with ${eligibleShardaScholarships[0].percentage}% scholarship.`
    } else {
      recommendation = '🏆 RECOMMENDED: NIU'
      budgetAnalysis = '💰 GUARANTEED VALUE: 50% scholarship with excellent career prospects.'
    }

    const wbeAdvantages = bestWBEScholarship ? `
🚀 WBE PARTNERSHIP EXCLUSIVE BENEFITS (FREE):
✓ FREE Visa Slot Arrangement (Save 12,000-20,000 BDT)
✓ FREE Premium Documentation Support  
✓ FREE Airport Reception & FRRO Registration
✓ FREE Accommodation Assistance
✓ FREE 24/7 Student Support Helpline
✓ Enhanced Scholarship Processing

💡 Total WBE Service Value: 25,000-35,000 BDT (FREE for WBE students)` : `
🌟 WBE STANDARD SERVICES (FREE):
✓ FREE Visa Slot Arrangement (Save 12,000-20,000 BDT)
✓ FREE Documentation Support
✓ FREE University Application Processing
✓ FREE Student Guidance & Support

💡 Total WBE Service Value: 15,000-25,000 BDT (FREE for WBE students)`

    const text = `${studentGreeting}📊 SMART UNIVERSITY COMPARISON & RECOMMENDATION

${recommendation}

🎯 PERSONALIZED ANALYSIS FOR YOUR PROFILE:
${budgetAnalysis}

📈 COMPLETE COST BREAKDOWN:

🇮🇳 NIU - ${comparisonData.niu.program.name}
💰 Total Investment: ${formatCurrency(niuTotal)}
🎓 Scholarship: 50% Guaranteed
⭐ Key Strengths: Affordable, guaranteed scholarship, industry partnerships

🇮🇳 SHARDA - ${comparisonData.sharda.program.name}
💰 Standard Total: ${formatCurrency(shardaTotal)}${bestWBEScholarship ? `
💰 WBE Enhanced: ${formatCurrency(wbeTotal)} (${formatCurrency(shardaTotal - wbeTotal)} additional savings)

📊 WBE Enhanced Fee Structure:
Year 1: ₹52,000 (WBE Comprehensive Package)
Years 2-${comparisonData.sharda.program.duration}: ₹32,000 per year (WBE Annual Fee)
Total WBE Additional Fees: ${formatCurrency(comparisonData.sharda.calculations.additionalFees.wbeComprehensive + comparisonData.sharda.calculations.additionalFees.wbeRecurring)}` : ''}
🎓 Scholarship: ${eligibleShardaScholarships.length > 0 ? `${eligibleShardaScholarships[0].percentage}%` : 'No scholarships available'}
⭐ Key Strengths: International campus, 95+ countries, premium facilities

${wbeAdvantages}

💡 WHY CHOOSE WBE EDUCATION CONSULTANCY:
• Other consultancies charge 15,000-25,000 BDT for basic services
• WBE provides ALL services completely FREE through university partnerships
• Exclusive scholarship enhancements and priority processing
• 24/7 support from application to graduation

${studentName ? `${studentName}, b` : 'B'}ased on your profile, ${recommendation.toLowerCase().includes('niu') ? 'NIU offers the best value with guaranteed savings and excellent career prospects.' : recommendation.toLowerCase().includes('wbe') ? 'Sharda via WBE Partnership provides premium education with maximum savings and FREE premium services.' : 'Sharda University offers international education experience worth the investment.'}

📞 Ready to proceed with the best option for your future? Contact WBE now!

Best regards,
WBE Education Consultancy

*All WBE services provided FREE. You only pay university fees directly.`.trim()

    try {
      await navigator.clipboard.writeText(text)
      alert('🎉 Smart comparison with personalized recommendation copied! Perfect for student guidance.')
    } catch (err) {
      alert('❌ Failed to copy. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            University Fee Comparison Tool
          </h1>
          <p className="text-lg text-gray-600">
            For WBE Counselors - Compare NIU, Sharda & Chandigarh Programs
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Reference Tool - All scholarship tiers displayed for transparency
          </p>
        </div>

        {/* Hierarchical Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Program Filters</h2>
              {activeFilterCount > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                  {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                </span>
              )}
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear All Filters
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Degree Level
                <span className="text-xs text-gray-500 ml-2">(Step 1: Select degree level)</span>
              </label>
              <select
                value={selectedDegree}
                onChange={(e) => {
                  setSelectedDegree(e.target.value)
                  setSelectedField('') // Clear field selection when degree level changes
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Degree Level</option>
                {degreeLevels.map(level => (
                  <option key={level} value={level}>
                    {level} ({degreeLevelCounts[level] || 0} programs)
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field of Study
                <span className="text-xs text-gray-500 ml-2">
                  {selectedDegree ? '(Step 2: Select field)' : '(Select degree level first)'}
                </span>
              </label>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                disabled={!selectedDegree}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  !selectedDegree ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                }`}
              >
                <option value="">
                  {selectedDegree ? `All Fields in ${selectedDegree}` : 'Select degree level first'}
                </option>
                {selectedDegree && fields.map(field => (
                  <option key={field} value={field}>
                    {field} ({fieldCounts[field] || 0} programs)
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Hierarchical Filter Explanation */}
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2 text-sm">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="font-medium text-blue-800 mb-1">How to use hierarchical filters:</div>
                <div className="text-blue-700 space-y-1">
                  <div>1. First select a <strong>Degree Level</strong> (Diploma, Bachelor, Masters, etc.)</div>
                  <div>2. Then choose a specific <strong>Field of Study</strong> within that level</div>
                  <div>3. Programs will be filtered to show only matches for your selection</div>
                </div>
                {activeFilterCount > 0 && (
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <div className="font-medium text-blue-800">Current Selection:</div>
                    <div className="text-blue-700">
                      {selectedDegree && <span><strong>Level:</strong> {selectedDegree}</span>}
                      {selectedDegree && selectedField && <span className="mx-2">•</span>}
                      {selectedField && <span><strong>Field:</strong> {selectedField}</span>}
                      <span className="ml-3 text-sm">
                        → {niuPrograms.length + shardaPrograms.length + chandigarhPrograms.length} programs found 
                        ({niuPrograms.length} NIU, {shardaPrograms.length} Sharda, {chandigarhPrograms.length} Chandigarh)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Student Information - Mobile Optimized */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Student Information</h2>
            <button
              onClick={clearStudentData}
              className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-full transition-colors"
            >
              🔄 Reset for New Student
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name (Optional)
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter student name..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  Student GPA (for Scholarship Filtering)
                  {studentGPA && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Active: {studentGPA}
                    </span>
                  )}
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={studentGPA}
                  onChange={(e) => setStudentGPA(e.target.value)}
                  placeholder="Enter GPA (e.g., 3.5)"
                  step="0.01"
                  min="0"
                  max="5"
                  inputMode="decimal"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg pr-12"
                />
                {studentGPA && (
                  <button
                    onClick={() => setStudentGPA('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                )}
              </div>
              {studentGPA && (
                <p className="text-xs text-purple-600 mt-1">
                  📊 Showing only scholarships available for GPA {studentGPA}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Program Selection - Three Universities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* NIU Programs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                NIU Programs ({niuPrograms.length})
              </h2>
              <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                Flat 50%
              </span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {niuPrograms.map(program => (
                <button
                  key={program.id}
                  onClick={() => handleProgramSelection(program, 'niu')}
                  className={`w-full text-left p-3 border rounded-lg transition-colors ${
                    selectedNiuProgram?.id === program.id
                      ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                      : 'border-gray-200 hover:border-green-500 hover:bg-green-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">{program.name}</div>
                  <div className="text-sm text-gray-600">
                    {program.duration} years • {formatCurrency(program.annualFees[0])} per year
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sharda Programs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Sharda Programs ({shardaPrograms.length})
              </h2>
              <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                GPA Tiers
              </span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {shardaPrograms.map(program => (
                <button
                  key={program.id}
                  onClick={() => handleProgramSelection(program, 'sharda')}
                  className={`w-full text-left p-3 border rounded-lg transition-colors ${
                    selectedShardaProgram?.id === program.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">{program.name}</div>
                  <div className="text-sm text-gray-600">
                    {program.duration} years • {formatCurrency(program.annualFees[0])} per year
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chandigarh Programs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Chandigarh Programs ({chandigarhPrograms.length})
              </h2>
              <span className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                GPA 50%/35%
              </span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {chandigarhPrograms.map(program => (
                <button
                  key={program.id}
                  onClick={() => handleProgramSelection(program, 'chandigarh')}
                  className={`w-full text-left p-3 border rounded-lg transition-colors ${
                    selectedChandigarhProgram?.id === program.id
                      ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                      : 'border-gray-200 hover:border-purple-500 hover:bg-purple-50'
                  }`}
                >
                  <div className="font-medium text-gray-900">{program.name}</div>
                  <div className="text-sm text-gray-600">
                    {program.duration} years • {formatCurrency(program.annualFees[0])} per year
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Match Quality Indicator */}
        {matchQuality && comparisonData && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">Program Match Quality</h3>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getMatchQualityBadge(matchQuality.quality).bg} ${getMatchQualityBadge(matchQuality.quality).text}`}>
                  <span>{getMatchQualityBadge(matchQuality.quality).icon}</span>
                  <span>{getMatchQualityBadge(matchQuality.quality).label}</span>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {matchQuality.reason}
              </div>
            </div>
            
            {matchQuality.quality === 'poor' && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-red-800">⚠️ Warning: Poor Program Match</h4>
                    <p className="text-sm text-red-700 mt-1">
                      The programs being compared are not equivalent. Consider using filters to find more similar programs, 
                      or clearly note this difference when presenting to students.
                    </p>
                    <div className="mt-2 text-xs text-red-600">
                      <strong>NIU:</strong> {selectedNiuProgram?.name} | <strong>Sharda:</strong> {selectedShardaProgram?.name}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {matchQuality.quality === 'approximate' && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-yellow-800">Note: Different Specializations</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Both programs are the same degree type but have different specializations. 
                      Please review the program details to ensure this comparison meets your needs.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Comparison Results */}
        {comparisonData && (comparisonData.niu || comparisonData.sharda) && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {comparisonData.niu && comparisonData.sharda ? 'Detailed Comparison' : 'Program Details'}
              </h2>
              <div className="flex flex-wrap gap-2">
                {comparisonData.niu && (
                  <button
                    onClick={copyNIUDetails}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy NIU Details
                  </button>
                )}
                {comparisonData.sharda && (
                  <button
                    onClick={copySmartShardaDetails}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Sharda Details
                  </button>
                )}
                {comparisonData.niu && comparisonData.sharda && (
                  <button
                    onClick={copySmartComparison}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Smart Comparison
                  </button>
                )}
              </div>
            </div>

            <div className={`grid grid-cols-1 ${
              (comparisonData.niu && comparisonData.sharda && comparisonData.chandigarh) ? 'lg:grid-cols-3' : 
              ((comparisonData.niu && comparisonData.sharda) || (comparisonData.niu && comparisonData.chandigarh) || (comparisonData.sharda && comparisonData.chandigarh)) ? 'lg:grid-cols-2' : ''
            } gap-6`}>
              {/* NIU Details */}
              {comparisonData.niu && (
                <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {comparisonData.niu.university.name}
                  </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {comparisonData.niu.program.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Duration: {comparisonData.niu.program.duration} years
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-2">Original Fees</h5>
                    {comparisonData.niu.program.annualFees.map((fee, index) => (
                      <div key={index} className="flex justify-between text-sm mb-1">
                        <span>Year {index + 1}:</span>
                        <span className="font-medium">{formatCurrency(fee)}</span>
                      </div>
                    ))}
            <div className="flex justify-between text-sm mb-1 pt-2 border-t">
              <span>One-Time Fee:</span>
              <span className="font-medium">{formatCurrency(comparisonData.niu.calculations.oneTimeFee)}</span>
            </div>
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Total Original:</span>
                      <span>{formatCurrency(comparisonData.niu.calculations.originalTotal)}</span>
                    </div>
                  </div>

                  <div className="bg-green-100 rounded-lg p-4">
                    <h5 className="font-semibold text-green-900 mb-2">
                      After 50% Scholarship (All BD Students)
                    </h5>
                    {comparisonData.niu.calculations.flat.yearlyFees.map((fee, index) => (
                      <div key={index} className="flex justify-between text-sm mb-1">
                        <span>Year {index + 1}:</span>
                        <span className="font-medium">{formatCurrency(fee)}</span>
                      </div>
                    ))}
            <div className="flex justify-between text-sm mb-1 pt-2 border-t border-green-200">
              <span>One-Time Fee:</span>
              <span className="font-medium">{formatCurrency(comparisonData.niu.calculations.oneTimeFee)}</span>
            </div>
                    <div className="flex justify-between font-bold text-green-900 pt-2 border-t border-green-200">
                      <span>Total After Scholarship:</span>
                      <span>{formatCurrency(comparisonData.niu.calculations.flat.totalFees)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-700 mt-2">
                      <span>You Save:</span>
                      <span className="font-semibold">{formatCurrency(comparisonData.niu.calculations.flat.savings)}</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-2">Program Highlights</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {comparisonData.niu.program.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-600 mr-2">✓</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                </div>
              )}

              {/* Sharda Details */}
              {comparisonData.sharda && (
                <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {comparisonData.sharda.university.name}
                  </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {comparisonData.sharda.program.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Duration: {comparisonData.sharda.program.duration} years
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-2">Original Fees</h5>
                    {comparisonData.sharda.program.annualFees.map((fee, index) => (
                      <div key={index} className="flex justify-between text-sm mb-1">
                        <span>Year {index + 1}:</span>
                        <span className="font-medium">{formatCurrency(fee)}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Year 1 - Admission/Procedure & Other Fees:</span>
                        <span className="font-medium">{formatCurrency(comparisonData.sharda.calculations.additionalFees.wbeComprehensive)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Years 2-{comparisonData.sharda.program.duration} - Annual Other Fees:</span>
                        <span className="font-medium text-blue-900">₹32,000 per year</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        <div className="mb-1"><strong>Year 1 breakdown:</strong></div>
                        <div>• Admission Fee: ₹30,000 (One-time)</div>
                        <div>• Medical & Insurance: ₹10,000</div>
                        <div>• Registration Fee: ₹15,000</div>
                        <div>• Examination Fee: ₹12,000</div>
                        <div className="mt-1"><strong>Years 2+ breakdown (₹32,000 per year):</strong></div>
                        <div>• Medical & Insurance: ₹5,000 per year</div>
                        <div>• Registration Fee: ₹15,000 per year</div>
                        <div>• Examination Fee: ₹12,000 per year</div>
                      </div>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Total Original:</span>
                      <span>{formatCurrency(comparisonData.sharda.calculations.originalTotal)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {comparisonData.sharda.calculations.noScholarship ? (
                      <div>
                        <h5 className="font-semibold text-blue-900 mb-3">Scholarship Information</h5>
                        <div className="bg-orange-100 border border-orange-200 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <svg className="w-5 h-5 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <h6 className="font-semibold text-orange-900">No Scholarships Available</h6>
                          </div>
                          <p className="text-sm text-orange-800 mb-3">
                            {comparisonData.sharda.calculations.categoryName}: No scholarships are offered for this program category.
                          </p>
                          <div className="bg-orange-50 rounded-lg p-3">
                            <div className="flex justify-between text-sm font-medium">
                              <span>Total Program Cost:</span>
                              <span className="text-orange-900">{formatCurrency(comparisonData.sharda.calculations.originalTotal)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h5 className="font-semibold text-blue-900 mb-3">
                          Scholarship Tiers - {comparisonData.sharda.calculations.categoryName}
                        </h5>
                        <p className="text-xs text-blue-700 mb-3">
                          {comparisonData.sharda.calculations.categoryDescription}
                        </p>
                        {getEligibleShardaScholarships(comparisonData.sharda.calculations).map((tier, index) => (
                          <div key={index} className="bg-blue-100 border border-blue-200 rounded-lg p-4 mb-3 hover:bg-blue-200 transition-colors cursor-pointer">
                            <div className="flex items-center justify-between mb-3">
                              <h6 className="font-semibold text-blue-900">{tier.name}</h6>
                              <span className="text-lg font-bold text-blue-900">{tier.percentage}%</span>
                            </div>
                            <p className="text-xs text-blue-700 mb-3">
                              GPA Range: {tier.gpaRange} • {tier.conditions}
                            </p>
                            
                            {/* Year-by-year breakdown */}
                            <div className="bg-white rounded-lg p-3 mb-3">
                              <h7 className="text-xs font-semibold text-blue-900 mb-2 block">Yearly Fees After {tier.percentage}% Scholarship:</h7>
                              {tier.yearlyFees.map((fee, yearIndex) => (
                                <div key={yearIndex} className="flex justify-between text-xs mb-1">
                                  <span>Year {yearIndex + 1}:</span>
                                  <div className="text-right">
                                    <span className="line-through text-gray-500 mr-2">
                                      {formatCurrency(comparisonData.sharda.program.annualFees[yearIndex])}
                                    </span>
                                    <span className="font-medium text-blue-900">{formatCurrency(fee)}</span>
                                  </div>
                                </div>
                              ))}
                              <div className="pt-2 border-t border-blue-200">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Year 1 - Admission/Procedure & Other Fees:</span>
                                  <span className="font-medium text-blue-900">{formatCurrency(tier.type === 'wbeEnhanced' ? comparisonData.sharda.calculations.additionalFees.wbeComprehensive : comparisonData.sharda.calculations.additionalFees.wbeComprehensive)}</span>
                                </div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Years 2-{comparisonData.sharda.program.duration} - Annual Other Fees:</span>
                                  <span className="font-medium text-blue-900">₹32,000 per year</span>
                                </div>
                                <div className="text-xs text-gray-600 mt-1 pl-2">
                                  <div className="mb-1"><strong>Year 1:</strong> ₹52,000</div>
                                  <div>• Admission Fee: ₹30,000 (One-time)</div>
                                  <div>• Medical & Insurance: ₹10,000</div>
                                  <div>• Registration Fee: ₹15,000</div>
                                  <div>• Examination Fee: ₹12,000</div>
                                  <div className="mt-1"><strong>Years 2+:</strong> ₹32,000 per year each</div>
                                  <div>• Medical & Insurance: ₹5,000 per year</div>
                                  <div>• Registration Fee: ₹15,000 per year</div>
                                  <div>• Examination Fee: ₹12,000 per year</div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between items-center bg-blue-50 rounded-lg p-2">
                                <span className="font-medium">Total After Scholarship:</span>
                                <span className="font-bold text-blue-900">{formatCurrency(tier.totalFees)}</span>
                              </div>
                              <div className="flex justify-between items-center bg-green-50 rounded-lg p-2">
                                <span className="font-medium text-green-700">You Save:</span>
                                <span className="font-bold text-green-700">{formatCurrency(tier.savings)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-2">Program Highlights</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {comparisonData.sharda.program.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-600 mr-2">✓</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                </div>
              )}

              {/* Chandigarh Details */}
              {comparisonData.chandigarh && (
                <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {comparisonData.chandigarh.university.name}
                  </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {comparisonData.chandigarh.program.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Duration: {comparisonData.chandigarh.program.duration} years
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-2">Original Fees</h5>
                    {comparisonData.chandigarh.program.annualFees.map((fee, index) => (
                      <div key={index} className="flex justify-between text-sm mb-1">
                        <span>Year {index + 1}:</span>
                        <span className="font-medium">{formatCurrency(fee)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm mb-1 pt-2 border-t">
                      <span>One-Time Fee:</span>
                      <span className="font-medium">{formatCurrency(comparisonData.chandigarh.calculations.oneTimeFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Annual Examination Fee:</span>
                      <span className="font-medium">₹10,000 per year</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Total Original:</span>
                      <span>{formatCurrency(comparisonData.chandigarh.calculations.originalTotal)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-semibold text-purple-900 mb-3">
                      GPA-Based Scholarship Tiers
                    </h5>
                    <p className="text-xs text-purple-700 mb-3">
                      Scholarship percentage depends on your academic GPA
                    </p>
                    {getEligibleChandigarhScholarships(comparisonData.chandigarh.calculations).map((tier, index) => (
                      <div key={index} className="bg-purple-100 border border-purple-200 rounded-lg p-4 mb-3 hover:bg-purple-200 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-3">
                          <h6 className="font-semibold text-purple-900">{tier.name}</h6>
                          <span className="text-lg font-bold text-purple-900">{tier.percentage}%</span>
                        </div>
                        <p className="text-xs text-purple-700 mb-3">
                          GPA Range: {tier.gpaRange} • {tier.conditions}
                        </p>
                        
                        {/* Year-by-year breakdown */}
                        <div className="bg-white rounded-lg p-3 mb-3">
                          <h7 className="text-xs font-semibold text-purple-900 mb-2 block">Yearly Fees After {tier.percentage}% Scholarship:</h7>
                          {tier.yearlyFees.map((fee, yearIndex) => (
                            <div key={yearIndex} className="flex justify-between text-xs mb-1">
                              <span>Year {yearIndex + 1}:</span>
                              <div className="text-right">
                                <span className="line-through text-gray-500 mr-2">
                                  {formatCurrency(comparisonData.chandigarh.program.annualFees[yearIndex])}
                                </span>
                                <span className="font-medium text-purple-900">{formatCurrency(fee)}</span>
                              </div>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-purple-200">
                            <div className="flex justify-between text-xs mb-1">
                              <span>One-Time Fee (Year 1):</span>
                              <span className="font-medium text-purple-900">{formatCurrency(comparisonData.chandigarh.calculations.oneTimeFee)}</span>
                            </div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Annual Examination Fee:</span>
                              <span className="font-medium text-purple-900">₹10,000 per year</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center bg-purple-50 rounded-lg p-2">
                            <span className="font-medium">Total After Scholarship:</span>
                            <span className="font-bold text-purple-900">{formatCurrency(tier.totalFees)}</span>
                          </div>
                          <div className="flex justify-between items-center bg-green-50 rounded-lg p-2">
                            <span className="font-medium text-green-700">You Save:</span>
                            <span className="font-bold text-green-700">{formatCurrency(tier.savings)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-2">Program Highlights</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {comparisonData.chandigarh.program.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-600 mr-2">✓</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                </div>
              )}

              {/* No Matching Programs Message */}
              {!comparisonData.sharda && comparisonData.niu && (
                <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🚫</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Sharda Programs Available</h3>
                    <p className="text-gray-600 mb-4">
                      Sharda University doesn't offer programs in this degree level category.
                    </p>
                    <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Alternative Options:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Try selecting a different degree level (Bachelor, Masters, etc.)</li>
                        <li>• NIU offers excellent programs with guaranteed 50% scholarship</li>
                        <li>• Contact WBE for personalized guidance on alternative programs</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* No Matching Programs Message for NIU */}
              {!comparisonData.niu && comparisonData.sharda && (
                <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🚫</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No NIU Programs Available</h3>
                    <p className="text-gray-600 mb-4">
                      NIU doesn't offer programs in this degree level category.
                    </p>
                    <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">Alternative Options:</h4>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• Try selecting a different degree level or field</li>
                        <li>• Sharda University offers diverse international programs</li>
                        <li>• Contact WBE for personalized program recommendations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
