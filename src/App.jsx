import { useState, useEffect } from 'react'
import niuData from '../data/universities/niu.json'
import shardaData from '../data/universities/sharda.json'
import chandigarhData from '../data/universities/chandigarh.json'
import galgotiasData from '../data/universities/galgotias.json'

function App() {
  const [selectedDegree, setSelectedDegree] = useState('')
  const [selectedField, setSelectedField] = useState('')
  const [niuPrograms, setNiuPrograms] = useState([])
  const [shardaPrograms, setShardaPrograms] = useState([])
  const [chandigarhPrograms, setChandigarhPrograms] = useState([])
  const [galgotiasPrograms, setGalgotiasPrograms] = useState([])
  const [comparisonData, setComparisonData] = useState(null)
  const [studentGPA, setStudentGPA] = useState('')
  const [studentName, setStudentName] = useState('')
  const [selectedNiuProgram, setSelectedNiuProgram] = useState(null)
  const [selectedShardaProgram, setSelectedShardaProgram] = useState(null)
  const [selectedChandigarhProgram, setSelectedChandigarhProgram] = useState(null)
  const [selectedGalgotiasProgram, setSelectedGalgotiasProgram] = useState(null)
  const [matchQuality, setMatchQuality] = useState(null)

  // All programs combined for filtering
  const allPrograms = [...niuData.programs, ...shardaData.programs, ...chandigarhData.programs, ...galgotiasData.programs]

  // Degree level mapping - map existing degree types to hierarchical categories
  const degreeLevelMapping = {
    'Diploma': ['Diploma', 'D.Pharm'],
    'Bachelor': ['B.Tech', 'B.Sc.', 'BBA', 'B.Com', 'B.A.', 'B.Des', 'B.Arch', 'BFA', 'B.Ed', 'BVA', 'B.Optom', 'BPT', 'B.Pharm', 'BJMC', 'BBA LLB', 'BA LLB', 'Pharm.D', 'B.Sc', 'BCA', 'BHM', 'BMRIT', 'B.Sc-FS', 'B.Sc-AG', 'B.Sc-IT', 'BA', 'BA-JMC', 'B.Interior', 'B.Des.', 'D-CMA', 'BPH', 'GNM'],
    'Bachelor (Lateral Entry)': ['B.Tech Lateral', 'B.Sc Lateral', 'BBA Lateral', 'B.Des Lateral', 'BHM Lateral', 'B.Optom Lateral', 'BPT Lateral', 'BMRIT Lateral'],
    'Masters': ['M.Tech', 'M.Sc.', 'MBA', 'M.Com', 'M.A.', 'M.Des', 'M.Arch', 'MFA', 'M.Ed', 'MPT', 'M.Pharm', 'LLM', 'MCA', 'MA', 'M.Sc', 'MFC', 'M.Optom', 'MA-JMC', 'MPH', 'PGDEMS'],
    'PhD': ['Ph.D.', 'PhD'],
    'Certificate': ['Certificate']
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
    const degreeLevels = ['Diploma', 'Bachelor', 'Bachelor (Lateral Entry)', 'Masters', 'PhD', 'Certificate']
    
    // Get available fields for selected degree level
    let availableFields = new Set()
    let filteredPrograms = allPrograms

    if (selectedDegree) {
      // Filter programs by degree level
      const levelPrograms = allPrograms.filter(p => getDegreeLevel(p) === selectedDegree)
      
      // Always populate available fields for the selected degree level
      levelPrograms.forEach(p => availableFields.add(p.field))
      
      if (selectedField) {
        // Both level and field selected
        filteredPrograms = levelPrograms.filter(p => p.field === selectedField)
      } else {
        // Only level selected
        filteredPrograms = levelPrograms
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
    let galgotiasFiltered = galgotiasData.programs

    if (selectedDegree) {
      // Filter by degree level
      niuFiltered = niuFiltered.filter(p => getDegreeLevel(p) === selectedDegree)
      shardaFiltered = shardaFiltered.filter(p => getDegreeLevel(p) === selectedDegree)
      chandigarhFiltered = chandigarhFiltered.filter(p => getDegreeLevel(p) === selectedDegree)
      galgotiasFiltered = galgotiasFiltered.filter(p => getDegreeLevel(p) === selectedDegree)
    }

    if (selectedField) {
      // Filter by field
      niuFiltered = niuFiltered.filter(p => p.field === selectedField)
      shardaFiltered = shardaFiltered.filter(p => p.field === selectedField)
      chandigarhFiltered = chandigarhFiltered.filter(p => p.field === selectedField)
      galgotiasFiltered = galgotiasFiltered.filter(p => p.field === selectedField)
    }

    setNiuPrograms(niuFiltered)
    setShardaPrograms(shardaFiltered)
    setChandigarhPrograms(chandigarhFiltered)
    setGalgotiasPrograms(galgotiasFiltered)
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

  // Enhanced program comparison with smart matching (Four Universities)
  const handleProgramSelection = (selectedProgram, fromUniversity) => {
    if (fromUniversity === 'niu') {
      setSelectedNiuProgram(selectedProgram)
      
      // Find matches in Sharda, Chandigarh, and Galgotias
      const shardaMatch = shardaPrograms.length > 0 ? findBestMatch(selectedProgram, shardaPrograms, 'sharda') : null
      const chandigarhMatch = chandigarhPrograms.length > 0 ? findBestMatch(selectedProgram, chandigarhPrograms, 'chandigarh') : null
      const galgotiasMatch = galgotiasPrograms.length > 0 ? findBestMatch(selectedProgram, galgotiasPrograms, 'galgotias') : null
      
      setSelectedShardaProgram(shardaMatch?.program || null)
      setSelectedChandigarhProgram(chandigarhMatch?.program || null)
      setSelectedGalgotiasProgram(galgotiasMatch?.program || null)
      
      // Set match quality based on best available match
      const matches = [shardaMatch, chandigarhMatch, galgotiasMatch].filter(m => m)
      if (matches.length > 0) {
        const bestMatch = matches.find(m => m.quality === 'perfect') || 
                         matches.find(m => m.quality === 'good') || 
                         matches[0]
        setMatchQuality(bestMatch)
      } else {
        setMatchQuality({
          quality: 'no-match',
          reason: `No comparable programs found at other universities for ${selectedProgram.name}`
        })
      }
      
      comparePrograms(selectedProgram, shardaMatch?.program || null, chandigarhMatch?.program || null, galgotiasMatch?.program || null)
      
    } else if (fromUniversity === 'sharda') {
      setSelectedShardaProgram(selectedProgram)
      
      // Find matches in NIU, Chandigarh, and Galgotias
      const niuMatch = niuPrograms.length > 0 ? findBestMatch(selectedProgram, niuPrograms, 'niu') : null
      const chandigarhMatch = chandigarhPrograms.length > 0 ? findBestMatch(selectedProgram, chandigarhPrograms, 'chandigarh') : null
      const galgotiasMatch = galgotiasPrograms.length > 0 ? findBestMatch(selectedProgram, galgotiasPrograms, 'galgotias') : null
      
      setSelectedNiuProgram(niuMatch?.program || null)
      setSelectedChandigarhProgram(chandigarhMatch?.program || null)
      setSelectedGalgotiasProgram(galgotiasMatch?.program || null)
      
      // Set match quality
      const matches = [niuMatch, chandigarhMatch, galgotiasMatch].filter(m => m)
      if (matches.length > 0) {
        const bestMatch = matches.find(m => m.quality === 'perfect') || 
                         matches.find(m => m.quality === 'good') || 
                         matches[0]
        setMatchQuality(bestMatch)
      } else {
        setMatchQuality({
          quality: 'no-match',
          reason: `No comparable programs found at other universities for ${selectedProgram.name}`
        })
      }
      
      comparePrograms(niuMatch?.program || null, selectedProgram, chandigarhMatch?.program || null, galgotiasMatch?.program || null)
      
    } else if (fromUniversity === 'chandigarh') {
      setSelectedChandigarhProgram(selectedProgram)
      
      // Find matches in NIU, Sharda, and Galgotias
      const niuMatch = niuPrograms.length > 0 ? findBestMatch(selectedProgram, niuPrograms, 'niu') : null
      const shardaMatch = shardaPrograms.length > 0 ? findBestMatch(selectedProgram, shardaPrograms, 'sharda') : null
      const galgotiasMatch = galgotiasPrograms.length > 0 ? findBestMatch(selectedProgram, galgotiasPrograms, 'galgotias') : null
      
      setSelectedNiuProgram(niuMatch?.program || null)
      setSelectedShardaProgram(shardaMatch?.program || null)
      setSelectedGalgotiasProgram(galgotiasMatch?.program || null)
      
      // Set match quality
      const matches = [niuMatch, shardaMatch, galgotiasMatch].filter(m => m)
      if (matches.length > 0) {
        const bestMatch = matches.find(m => m.quality === 'perfect') || 
                         matches.find(m => m.quality === 'good') || 
                         matches[0]
        setMatchQuality(bestMatch)
      } else {
        setMatchQuality({
          quality: 'no-match',
          reason: `No comparable programs found at other universities for ${selectedProgram.name}`
        })
      }
      
      comparePrograms(niuMatch?.program || null, shardaMatch?.program || null, selectedProgram, galgotiasMatch?.program || null)
      
    } else {
      // fromUniversity === 'galgotias'
      setSelectedGalgotiasProgram(selectedProgram)
      
      // Find matches in NIU, Sharda, and Chandigarh
      const niuMatch = niuPrograms.length > 0 ? findBestMatch(selectedProgram, niuPrograms, 'niu') : null
      const shardaMatch = shardaPrograms.length > 0 ? findBestMatch(selectedProgram, shardaPrograms, 'sharda') : null
      const chandigarhMatch = chandigarhPrograms.length > 0 ? findBestMatch(selectedProgram, chandigarhPrograms, 'chandigarh') : null
      
      setSelectedNiuProgram(niuMatch?.program || null)
      setSelectedShardaProgram(shardaMatch?.program || null)
      setSelectedChandigarhProgram(chandigarhMatch?.program || null)
      
      // Set match quality
      const matches = [niuMatch, shardaMatch, chandigarhMatch].filter(m => m)
      if (matches.length > 0) {
        const bestMatch = matches.find(m => m.quality === 'perfect') || 
                         matches.find(m => m.quality === 'good') || 
                         matches[0]
        setMatchQuality(bestMatch)
      } else {
        setMatchQuality({
          quality: 'no-match',
          reason: `No comparable programs found at other universities for ${selectedProgram.name}`
        })
      }
      
      comparePrograms(niuMatch?.program || null, shardaMatch?.program || null, chandigarhMatch?.program || null, selectedProgram)
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

    // Chandigarh has recurring fees: examination fee (₹5,000/year) and health insurance (₹3,000/year)
    if (university.id === 'chandigarh') {
      if (university.additionalFees.recurring) {
        const examFee = university.additionalFees.recurring.examination?.amount || 0
        const healthInsurance = university.additionalFees.recurring.healthInsurance?.amount || 0
        const annualRecurring = examFee + healthInsurance // ₹5,000 + ₹3,000 = ₹8,000 per year
        additionalFees.recurring = annualRecurring * program.duration
      }
    }

    // Galgotias has recurring fees: examination fee (₹20,000/year)
    if (university.id === 'galgotias') {
      if (university.additionalFees.recurring) {
        const examFee = university.additionalFees.recurring.examination?.amount || 0
        additionalFees.recurring = examFee * program.duration // ₹20,000 per year
      }
      
      // Handle industry fee for BCA and MCA industry-oriented programs
      if (program.hasIndustryFee && program.industryFeeFirstYear) {
        additionalFees.oneTime += program.industryFeeFirstYear
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

    // Galgotias has course-based scholarships: 60% for B.Tech, 50% for others
    if (university.id === 'galgotias') {
      // Determine scholarship percentage based on degree type
      // Only B.Tech gets 60%, all other courses (including M.Tech) get 50%
      const isBtech = program.degree === 'B.Tech'
      const discountPercentage = isBtech 
        ? university.scholarships.bangladeshStudents.btech.percentage 
        : university.scholarships.bangladeshStudents.others.percentage
      
      const discountedAnnual = program.annualFees.map(fee => fee * (1 - (discountPercentage / 100)))
      const totalDiscounted = discountedAnnual.reduce((sum, fee) => sum + fee, 0)

      return {
        flat: {
          percentage: discountPercentage,
          yearlyFees: discountedAnnual,
          totalFees: totalDiscounted + totalAdditionalFees,
          savings: totalAnnualFees - totalDiscounted
        },
        oneTimeFee: additionalFees.oneTime,
        additionalFees,
        originalTotal: totalAnnualFees + totalAdditionalFees,
        scholarshipType: 'course-based'
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

  const comparePrograms = (niuProgram, shardaProgram, chandigarhProgram, galgotiasProgram) => {
    const niuCalc = niuProgram ? calculateFees(niuProgram, niuData) : null
    const shardaCalc = shardaProgram ? calculateFees(shardaProgram, shardaData) : null
    const chandigarhCalc = chandigarhProgram ? calculateFees(chandigarhProgram, chandigarhData) : null
    const galgotiasCalc = galgotiasProgram ? calculateFees(galgotiasProgram, galgotiasData) : null

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
      } : null,
      galgotias: galgotiasProgram ? {
        program: galgotiasProgram,
        university: galgotiasData,
        calculations: galgotiasCalc
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

  // Get all available scholarship tiers for Sharda (all tiers, not filtered by GPA)
  const getAllShardaScholarshipTiers = (calculations) => {
    const allTiers = []
    
    // Add standard tiers
    if (calculations.tiers && calculations.tiers.length > 0) {
      calculations.tiers.forEach(tier => {
        if (!allTiers.find(t => t.percentage === tier.percentage && t.type === 'standard')) {
          allTiers.push({ ...tier, type: 'standard' })
        }
      })
    }
    
    // Add WBE enhanced tiers
    if (calculations.wbeEnhanced && calculations.wbeEnhanced.length > 0) {
      calculations.wbeEnhanced.forEach(tier => {
        if (!allTiers.find(t => t.percentage === tier.percentage && t.type === 'wbeEnhanced')) {
          allTiers.push({ ...tier, type: 'wbeEnhanced' })
        }
      })
    }
    
    return allTiers.sort((a, b) => b.percentage - a.percentage)
  }

  // Get all available scholarship tiers for Chandigarh
  const getAllChandigarhScholarshipTiers = (calculations) => {
    return calculations.tiers || []
  }

  // Get all available scholarship options for NIU
  const getNIUScholarshipOptions = () => {
    return [
      { percentage: 0, label: 'No Scholarship' },
      { percentage: 50, label: '50% Scholarship' }
    ]
  }

  // Get all available scholarship options for Sharda
  const getShardaScholarshipOptions = (calculations) => {
    const options = [
      { percentage: 0, label: 'No Scholarship' }
    ]
    
    // Get all unique scholarship percentages from tiers
    const allTiers = getAllShardaScholarshipTiers(calculations)
    const uniquePercentages = new Set()
    
    allTiers.forEach(tier => {
      if (!uniquePercentages.has(tier.percentage)) {
        uniquePercentages.add(tier.percentage)
        options.push({
          percentage: tier.percentage,
          label: `${tier.percentage}% Scholarship`,
          isWBE: tier.type === 'wbeEnhanced'
        })
      }
    })
    
    // Sort by percentage (descending)
    return options.sort((a, b) => b.percentage - a.percentage)
  }

  // Get all available scholarship options for Chandigarh
  const getChandigarhScholarshipOptions = (calculations) => {
    const options = [
      { percentage: 0, label: 'No Scholarship' }
    ]
    
    // Get all tiers (35% and 50%)
    const tiers = getAllChandigarhScholarshipTiers(calculations)
    tiers.forEach(tier => {
      options.push({
        percentage: tier.percentage,
        label: `${tier.percentage}% Scholarship`,
        gpaRange: tier.gpaRange
      })
    })
    
    // Sort by percentage (descending)
    return options.sort((a, b) => b.percentage - a.percentage)
  }

  // Get all available scholarship options for Galgotias
  const getGalgotiasScholarshipOptions = (program) => {
    const options = [
      { percentage: 0, label: 'No Scholarship' },
      { percentage: 50, label: '50% Scholarship' }
    ]
    
    // Add 60% option if it's a B.Tech program
    if (program.degree === 'B.Tech') {
      options.push({ percentage: 60, label: '60% Scholarship (B.Tech)' })
    }
    
    // Sort by percentage (descending)
    return options.sort((a, b) => b.percentage - a.percentage)
  }

  // Calculate fees with specific scholarship percentage for any university
  const calculateFeesWithScholarship = (program, university, scholarshipPercentage) => {
    const totalAnnualFees = program.annualFees.reduce((sum, fee) => sum + fee, 0)
    const oneTimeFee = university.additionalFees.oneTime.amount
    const additionalFees = {
      oneTime: oneTimeFee,
      recurring: 0
    }

    // Calculate recurring fees based on university
    if (university.id === 'sharda') {
      if (university.additionalFees.recurring) {
        const examFee = university.additionalFees.recurring.examination.amount * program.duration
        const regFee = university.additionalFees.recurring.registration.amount * (program.duration - 1)
        const medicalFee = university.additionalFees.recurring.medical.amount * (program.duration - 1)
        const alumniFee = university.additionalFees.recurring.alumni.amount
        additionalFees.recurring = examFee + regFee + medicalFee + alumniFee
      }
    } else if (university.id === 'chandigarh') {
      if (university.additionalFees.recurring) {
        const examFee = university.additionalFees.recurring.examination?.amount || 0
        const healthInsurance = university.additionalFees.recurring.healthInsurance?.amount || 0
        const annualRecurring = examFee + healthInsurance
        additionalFees.recurring = annualRecurring * program.duration
      }
    } else if (university.id === 'galgotias') {
      if (university.additionalFees.recurring) {
        const examFee = university.additionalFees.recurring.examination?.amount || 0
        additionalFees.recurring = examFee * program.duration
      }
      if (program.hasIndustryFee && program.industryFeeFirstYear) {
        additionalFees.oneTime += program.industryFeeFirstYear
      }
    }

    // Calculate discounted fees
    const discountedAnnual = program.annualFees.map(fee => fee * (1 - (scholarshipPercentage / 100)))
    const totalDiscounted = discountedAnnual.reduce((sum, fee) => sum + fee, 0)
    const totalAdditionalFees = additionalFees.oneTime + additionalFees.recurring

    return {
      percentage: scholarshipPercentage,
      yearlyFees: discountedAnnual,
      totalFees: totalDiscounted + totalAdditionalFees,
      savings: totalAnnualFees - totalDiscounted,
      oneTimeFee: additionalFees.oneTime,
      additionalFees,
      originalTotal: totalAnnualFees + totalAdditionalFees
    }
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

  // Copy NIU details with specific scholarship percentage
  const copyNIUDetails = async (scholarshipPercentage = 50) => {
    if (!comparisonData?.niu) return

    const program = comparisonData.niu.program
    const university = comparisonData.niu.university
    
    const feeCalc = calculateFeesWithScholarship(program, university, scholarshipPercentage)
    
    // Build year-by-year breakdown
    let yearBreakdown = ''
    for (let i = 0; i < program.duration; i++) {
      const originalFee = program.annualFees[i]
      const scholarshipAmount = scholarshipPercentage > 0 ? Math.round(originalFee * (scholarshipPercentage / 100)) : 0
      const netTuition = scholarshipPercentage > 0 ? originalFee - scholarshipAmount : originalFee
      const additionalFee = i === 0 ? feeCalc.oneTimeFee : 0
      const yearTotal = netTuition + additionalFee
      
      yearBreakdown += `*Year ${i + 1}:*\n`
      yearBreakdown += `Tuition Fee: ${formatCurrency(originalFee)}\n`
      if (scholarshipPercentage > 0) {
        yearBreakdown += `Scholarship (${scholarshipPercentage}%): –${formatCurrency(scholarshipAmount)}\n`
        yearBreakdown += `Net Tuition: ${formatCurrency(netTuition)}\n`
      }
      if (i === 0) {
        yearBreakdown += `Admission Fee: ${formatCurrency(additionalFee)}\n`
      }
      yearBreakdown += `✅ *Total Year ${i + 1} = ${formatCurrency(yearTotal)}*\n\n`
    }

    const scholarshipText = scholarshipPercentage === 0 
      ? '*💰 FEE STRUCTURE (No Scholarship)*'
      : `*💰 FEE STRUCTURE (After ${scholarshipPercentage}% Scholarship)*`

    const text = `*🌟 NIU University*

*Program:* ${program.name}

*Duration:* ${program.duration} years

${scholarshipText}

${yearBreakdown}---

*GRAND TOTAL (All ${program.duration} Years)*

Without scholarship: ${formatCurrency(feeCalc.originalTotal)}

${scholarshipPercentage > 0 ? `*Savings with ${scholarshipPercentage}% Scholarship: ${formatCurrency(feeCalc.savings)}*\n\n*Total Payable Fees for Entire Course: ${formatCurrency(feeCalc.totalFees)}*` : `*Total Payable Fees for Entire Course: ${formatCurrency(feeCalc.totalFees)}*`}`.trim()

    try {
      await navigator.clipboard.writeText(text)
      alert(`✅ NIU details (${scholarshipPercentage === 0 ? 'No Scholarship' : scholarshipPercentage + '% Scholarship'}) copied! Ready for WhatsApp.`)
    } catch (err) {
      alert('❌ Failed to copy. Please try again.')
    }
  }

  // Copy Sharda details with specific scholarship percentage
  const copyShardaDetails = async (scholarshipPercentage = null) => {
    if (!comparisonData?.sharda) return

    const studentNameText = studentName ? `*Hi ${studentName}!* 👋\n\n` : '*Hi!* 👋\n\n'
    const program = comparisonData.sharda.program
    const calc = comparisonData.sharda.calculations
    const university = comparisonData.sharda.university

    let feeCalc, tierInfo, isWBE = false

    // Handle no scholarship case
    if (scholarshipPercentage === 0 || (scholarshipPercentage === null && calc.noScholarship)) {
      feeCalc = calculateFeesWithScholarship(program, university, 0)
      tierInfo = null
    } else if (scholarshipPercentage !== null) {
      // Find matching tier in calculated data
      let matchingTier = null
      
      // Check standard tiers
      if (calc.tiers && calc.tiers.length > 0) {
        matchingTier = calc.tiers.find(t => t.percentage === scholarshipPercentage)
      }
      
      // Check WBE enhanced tiers
      if (!matchingTier && calc.wbeEnhanced && calc.wbeEnhanced.length > 0) {
        matchingTier = calc.wbeEnhanced.find(t => t.percentage === scholarshipPercentage)
        if (matchingTier) isWBE = true
      }
      
      if (matchingTier) {
        // Use calculated tier data
        feeCalc = {
          percentage: matchingTier.percentage,
          yearlyFees: matchingTier.yearlyFees,
          totalFees: matchingTier.totalFees,
          savings: matchingTier.savings,
          oneTimeFee: isWBE ? calc.additionalFees.wbeComprehensive : calc.oneTimeFee,
          additionalFees: calc.additionalFees,
          tierName: matchingTier.name,
          conditions: matchingTier.conditions,
          originalTotal: calc.originalTotal
        }
        tierInfo = matchingTier
      } else {
        // Calculate with specified percentage
        feeCalc = calculateFeesWithScholarship(program, university, scholarshipPercentage)
        feeCalc.originalTotal = calc.originalTotal
        tierInfo = null
      }
    } else {
      // Default: use best eligible scholarship
      const eligibleScholarships = getEligibleShardaScholarships(calc)
      const bestWBEScholarship = getBestWBEScholarship(calc)
      
      if (bestWBEScholarship && eligibleScholarships.length > 0 && 
          bestWBEScholarship.totalFees < eligibleScholarships[0].totalFees) {
        tierInfo = bestWBEScholarship
        isWBE = true
        feeCalc = {
          percentage: bestWBEScholarship.percentage,
          yearlyFees: bestWBEScholarship.yearlyFees,
          totalFees: bestWBEScholarship.totalFees,
          savings: bestWBEScholarship.savings,
          oneTimeFee: calc.additionalFees.wbeComprehensive,
          additionalFees: calc.additionalFees,
          tierName: bestWBEScholarship.name,
          conditions: bestWBEScholarship.conditions,
          originalTotal: calc.originalTotal
        }
      } else if (eligibleScholarships.length > 0) {
        tierInfo = eligibleScholarships[0]
        feeCalc = {
          percentage: tierInfo.percentage,
          yearlyFees: tierInfo.yearlyFees,
          totalFees: tierInfo.totalFees,
          savings: tierInfo.savings,
          oneTimeFee: calc.oneTimeFee,
          additionalFees: calc.additionalFees,
          tierName: tierInfo.name,
          conditions: tierInfo.conditions,
          originalTotal: calc.originalTotal
        }
    } else {
        feeCalc = calculateFeesWithScholarship(program, university, 0)
        feeCalc.originalTotal = calc.originalTotal
        tierInfo = null
      }
    }

    // Build year-by-year breakdown using calculated tier data
    let yearBreakdown = ''
    // Year 1: ₹52,000 (Admission Fee including all services)
    // Years 2+: ₹32,000 (Registration + Exam + Medical/Insurance)
    const year1AdditionalFee = calc.additionalFees.wbeComprehensive // ₹52,000
    const years2PlusFee = 32000 // ₹32,000 per year for years 2+
    
    for (let i = 0; i < program.duration; i++) {
      const originalFee = program.annualFees[i]
      // Use calculated net tuition from tier if available, otherwise calculate
      const netTuition = feeCalc.yearlyFees ? feeCalc.yearlyFees[i] : (feeCalc.percentage > 0 ? originalFee * (1 - feeCalc.percentage / 100) : originalFee)
      const scholarshipAmount = feeCalc.percentage > 0 ? Math.round(originalFee - netTuition) : 0
      const additionalFee = i === 0 ? year1AdditionalFee : years2PlusFee
      const yearTotal = Math.round(netTuition) + additionalFee
      
      yearBreakdown += `*Year ${i + 1}:*\n`
      yearBreakdown += `Tuition Fee: ${formatCurrency(originalFee)}\n`
      if (feeCalc.percentage > 0) {
        yearBreakdown += `Scholarship (${feeCalc.percentage}%): –${formatCurrency(scholarshipAmount)}\n`
        yearBreakdown += `Net Tuition: ${formatCurrency(Math.round(netTuition))}\n`
      }
      if (i === 0) {
        yearBreakdown += `Admission Fee: ${formatCurrency(additionalFee)} (Including Registration fee, Examination fee, Insurance fee, and FRRO/VISA assistance)\n`
      } else {
        yearBreakdown += `Other Fees: ${formatCurrency(additionalFee)} (Examination Fee, Registration fee, Insurance fee, and FRRO)\n`
      }
      yearBreakdown += `✅ *Total Year ${i + 1} = ${formatCurrency(yearTotal)}*\n\n`
    }

    const scholarshipText = feeCalc.percentage === 0
      ? '*💰 FEE STRUCTURE (No Scholarship)*'
      : `*💰 FEE STRUCTURE (After ${feeCalc.percentage}% Scholarship)*`

    const text = `*🌟 Sharda University*

*Program:* ${program.name}

*Duration:* ${program.duration} years

${scholarshipText}

${yearBreakdown}---

*GRAND TOTAL (All ${program.duration} Years)*

Without scholarship: ${formatCurrency(feeCalc.originalTotal)}

${feeCalc.percentage > 0 ? `*Savings with ${feeCalc.percentage}% Scholarship: ${formatCurrency(feeCalc.savings)}*\n\n*Total Payable Fees for Entire Course: ${formatCurrency(feeCalc.totalFees)}*` : `*Total Payable Fees for Entire Course: ${formatCurrency(feeCalc.totalFees)}*`}`.trim()

    try {
      await navigator.clipboard.writeText(text)
      alert(`✅ Sharda details (${feeCalc.percentage === 0 ? 'No Scholarship' : feeCalc.percentage + '% Scholarship'}) copied! Ready for WhatsApp.`)
    } catch (err) {
      alert('❌ Failed to copy. Please try again.')
    }
  }

  // Legacy compatibility - Smart Sharda Details
  const copySmartShardaDetails = async () => {
    await copyShardaDetails(null)
  }

  // Copy Chandigarh details with specific scholarship percentage
  const copyChandigarhDetails = async (scholarshipPercentage = null) => {
    if (!comparisonData?.chandigarh) return

    const program = comparisonData.chandigarh.program
    const calc = comparisonData.chandigarh.calculations
    const university = comparisonData.chandigarh.university

    let feeCalc, tierInfo

    // Handle no scholarship case
    if (scholarshipPercentage === 0) {
      feeCalc = calculateFeesWithScholarship(program, university, 0)
      tierInfo = null
    } else if (scholarshipPercentage !== null) {
      // Find matching tier in calculated data
      const matchingTier = calc.tiers?.find(t => t.percentage === scholarshipPercentage)
      
      if (matchingTier) {
        // Use calculated tier data
        feeCalc = {
          percentage: matchingTier.percentage,
          yearlyFees: matchingTier.yearlyFees,
          totalFees: matchingTier.totalFees,
          savings: matchingTier.savings,
          oneTimeFee: calc.oneTimeFee,
          additionalFees: calc.additionalFees,
          tierName: matchingTier.name,
          gpaRange: matchingTier.gpaRange,
          conditions: matchingTier.conditions,
          originalTotal: calc.originalTotal
        }
        tierInfo = matchingTier
      } else {
        // Calculate with specified percentage
        feeCalc = calculateFeesWithScholarship(program, university, scholarshipPercentage)
        tierInfo = null
      }
    } else {
      // Default: use best eligible tier
      const eligibleTiers = getEligibleChandigarhScholarships(calc)
      if (eligibleTiers.length > 0) {
        tierInfo = eligibleTiers[0]
        feeCalc = {
          percentage: tierInfo.percentage,
          yearlyFees: tierInfo.yearlyFees,
          totalFees: tierInfo.totalFees,
          savings: tierInfo.savings,
          oneTimeFee: calc.oneTimeFee,
          additionalFees: calc.additionalFees,
          tierName: tierInfo.name,
          gpaRange: tierInfo.gpaRange,
          conditions: tierInfo.conditions,
          originalTotal: calc.originalTotal
        }
      } else {
        feeCalc = calculateFeesWithScholarship(program, university, 0)
        tierInfo = null
      }
    }

    // Build year-by-year breakdown
    let yearBreakdown = ''
    const oneTimeFee = calc.oneTimeFee
    const examFeeAnnual = 5000
    const healthInsuranceAnnual = 3000
    
    for (let i = 0; i < program.duration; i++) {
      const originalFee = program.annualFees[i]
      const scholarshipAmount = feeCalc.percentage > 0 ? Math.round(originalFee * (feeCalc.percentage / 100)) : 0
      const netTuition = feeCalc.percentage > 0 ? originalFee - scholarshipAmount : originalFee
      const additionalFees = i === 0 ? oneTimeFee + examFeeAnnual + healthInsuranceAnnual : examFeeAnnual + healthInsuranceAnnual
      const yearTotal = netTuition + additionalFees
      
      yearBreakdown += `*Year ${i + 1}:*\n`
      yearBreakdown += `Tuition Fee: ${formatCurrency(originalFee)}\n`
      if (feeCalc.percentage > 0) {
        yearBreakdown += `Scholarship (${feeCalc.percentage}%): –${formatCurrency(scholarshipAmount)}\n`
        yearBreakdown += `Net Tuition: ${formatCurrency(netTuition)}\n`
      }
      if (i === 0) {
        yearBreakdown += `Admission Fee: ${formatCurrency(oneTimeFee)}\n`
      }
      yearBreakdown += `Exam Fee: ${formatCurrency(examFeeAnnual)}\n`
      yearBreakdown += `Health Insurance: ${formatCurrency(healthInsuranceAnnual)}\n`
      yearBreakdown += `✅ *Total Year ${i + 1} = ${formatCurrency(yearTotal)}*\n\n`
    }

    const scholarshipText = feeCalc.percentage === 0
      ? '*💰 FEE STRUCTURE (No Scholarship)*'
      : `*💰 FEE STRUCTURE (After ${feeCalc.percentage}% Scholarship)*`

    const text = `*🌟 Chandigarh University*

*Program:* ${program.name}

*Duration:* ${program.duration} years

${scholarshipText}

${yearBreakdown}---

*GRAND TOTAL (All ${program.duration} Years)*

Without scholarship: ${formatCurrency(feeCalc.originalTotal)}

${feeCalc.percentage > 0 ? `*Savings with ${feeCalc.percentage}% Scholarship: ${formatCurrency(feeCalc.savings)}*\n\n*Total Payable Fees for Entire Course: ${formatCurrency(feeCalc.totalFees)}*` : `*Total Payable Fees for Entire Course: ${formatCurrency(feeCalc.totalFees)}*`}`.trim()

      try {
        await navigator.clipboard.writeText(text)
      alert(`✅ Chandigarh details (${feeCalc.percentage === 0 ? 'No Scholarship' : feeCalc.percentage + '% Scholarship'}) copied! Ready for WhatsApp.`)
      } catch (err) {
        alert('❌ Failed to copy. Please try again.')
      }
  }

  // Copy Galgotias details with specific scholarship percentage
  const copyGalgotiasDetails = async (scholarshipPercentage = null) => {
    if (!comparisonData?.galgotias) return

    const program = comparisonData.galgotias.program
    const calc = comparisonData.galgotias.calculations
    const university = comparisonData.galgotias.university

    let feeCalc

    // Determine default scholarship if not specified
    if (scholarshipPercentage === null) {
      // Use the calculated default (60% for B.Tech, 50% for others)
      feeCalc = {
        percentage: calc.flat.percentage,
        yearlyFees: calc.flat.yearlyFees,
        totalFees: calc.flat.totalFees,
        savings: calc.flat.savings,
        oneTimeFee: calc.oneTimeFee,
        additionalFees: calc.additionalFees,
        originalTotal: calc.originalTotal
      }
      } else {
      // Use specified scholarship percentage
      feeCalc = calculateFeesWithScholarship(program, university, scholarshipPercentage)
    }

    // Build year-by-year breakdown
    let yearBreakdown = ''
    const oneTimeFee = calc.oneTimeFee
    const examFeeAnnual = 20000
    const industryFee = program.hasIndustryFee ? program.industryFeeFirstYear : 0
    
    for (let i = 0; i < program.duration; i++) {
      const originalFee = program.annualFees[i]
      const scholarshipAmount = feeCalc.percentage > 0 ? Math.round(originalFee * (feeCalc.percentage / 100)) : 0
      const netTuition = feeCalc.percentage > 0 ? originalFee - scholarshipAmount : originalFee
      const additionalFees = i === 0 ? oneTimeFee + examFeeAnnual + industryFee : examFeeAnnual
      const yearTotal = netTuition + additionalFees
      
      yearBreakdown += `*Year ${i + 1}:*\n`
      yearBreakdown += `Tuition Fee: ${formatCurrency(originalFee)}\n`
      if (feeCalc.percentage > 0) {
        yearBreakdown += `Scholarship (${feeCalc.percentage}%): –${formatCurrency(scholarshipAmount)}\n`
        yearBreakdown += `Net Tuition: ${formatCurrency(netTuition)}\n`
      }
      if (i === 0) {
        yearBreakdown += `Admission Fee: ${formatCurrency(oneTimeFee)}\n`
        if (industryFee > 0) {
          yearBreakdown += `Industry Fee: ${formatCurrency(industryFee)}\n`
        }
      }
      yearBreakdown += `Exam Fee: ${formatCurrency(examFeeAnnual)}\n`
      yearBreakdown += `✅ *Total Year ${i + 1} = ${formatCurrency(yearTotal)}*\n\n`
    }

    const scholarshipText = feeCalc.percentage === 0
      ? '*💰 FEE STRUCTURE (No Scholarship)*'
      : `*💰 FEE STRUCTURE (After ${feeCalc.percentage}% Scholarship)*`

    const text = `*🌟 Galgotias University*

*Program:* ${program.name}

*Duration:* ${program.duration} years

${scholarshipText}

${yearBreakdown}---

*GRAND TOTAL (All ${program.duration} Years)*

Without scholarship: ${formatCurrency(feeCalc.originalTotal)}

${feeCalc.percentage > 0 ? `*Savings with ${feeCalc.percentage}% Scholarship: ${formatCurrency(feeCalc.savings)}*\n\n*Total Payable Fees for Entire Course: ${formatCurrency(feeCalc.totalFees)}*` : `*Total Payable Fees for Entire Course: ${formatCurrency(feeCalc.totalFees)}*`}`.trim()

      try {
        await navigator.clipboard.writeText(text)
      alert(`✅ Galgotias details (${feeCalc.percentage === 0 ? 'No Scholarship' : feeCalc.percentage + '% Scholarship'}) copied! Ready for WhatsApp.`)
      } catch (err) {
        alert('❌ Failed to copy. Please try again.')
    }
  }

  // Smart Full Comparison - WhatsApp optimized with all four universities
  const copySmartComparison = async () => {
    if (!comparisonData) return

    // Count available universities
    const universityCount = (comparisonData.niu ? 1 : 0) + (comparisonData.sharda ? 1 : 0) + (comparisonData.chandigarh ? 1 : 0) + (comparisonData.galgotias ? 1 : 0)
    if (universityCount < 2) {
      alert('⚠️ Please select at least 2 universities to compare.')
      return
    }

    const studentNameText = studentName ? `*Hi ${studentName}!* 👋\n\n` : '*Hi!* 👋\n\n'
    
    // Calculate totals for all available universities
    const niuTotal = comparisonData.niu ? comparisonData.niu.calculations.flat.totalFees : 0
    const eligibleShardaScholarships = comparisonData.sharda ? getEligibleShardaScholarships(comparisonData.sharda.calculations) : []
    const bestWBEScholarship = comparisonData.sharda ? getBestWBEScholarship(comparisonData.sharda.calculations) : null
    const shardaTotal = comparisonData.sharda ? (eligibleShardaScholarships.length > 0 ? eligibleShardaScholarships[0].totalFees : comparisonData.sharda.calculations.originalTotal) : 0
    const wbeTotal = bestWBEScholarship ? bestWBEScholarship.totalFees : shardaTotal

    const eligibleChandigarhTiers = comparisonData.chandigarh ? getEligibleChandigarhScholarships(comparisonData.chandigarh.calculations) : []
    const chandigarhTotal = comparisonData.chandigarh ? (eligibleChandigarhTiers.length > 0 ? eligibleChandigarhTiers[0].totalFees : comparisonData.chandigarh.calculations.originalTotal) : 0
    const chandigarhTier = eligibleChandigarhTiers.length > 0 ? eligibleChandigarhTiers[0] : null

    const galgotiasTotal = comparisonData.galgotias ? comparisonData.galgotias.calculations.flat.totalFees : 0
    const galgotiasScholarship = comparisonData.galgotias ? `${comparisonData.galgotias.calculations.flat.percentage}%` : 'N/A'

    // Find the best option
    const options = []
    if (comparisonData.niu) options.push({ name: 'NIU', total: niuTotal, scholarship: '50%', program: comparisonData.niu.program })
    if (comparisonData.sharda) {
      options.push({ name: 'Sharda', total: shardaTotal, scholarship: eligibleShardaScholarships.length > 0 ? `${eligibleShardaScholarships[0].percentage}%` : 'N/A', program: comparisonData.sharda.program })
      if (bestWBEScholarship && wbeTotal < shardaTotal) {
        options.push({ name: 'Sharda (WBE)', total: wbeTotal, scholarship: `${bestWBEScholarship.percentage}%`, program: comparisonData.sharda.program, isWBE: true })
      }
    }
    if (comparisonData.chandigarh) {
      options.push({ name: 'Chandigarh', total: chandigarhTotal, scholarship: chandigarhTier ? `${chandigarhTier.percentage}%` : '35-50%', program: comparisonData.chandigarh.program })
    }
    if (comparisonData.galgotias) {
      options.push({ name: 'Galgotias', total: galgotiasTotal, scholarship: galgotiasScholarship, program: comparisonData.galgotias.program })
    }

    if (options.length === 0) {
      alert('⚠️ No programs available for comparison.')
      return
    }

    const bestOption = options.reduce((best, current) => 
      current.total < best.total ? current : best
    )

    let recommendation = ''
    if (bestOption.name === 'NIU') {
      recommendation = `*🏆 Best Value: NIU*\n*💰 Most Affordable Option*`
    } else if (bestOption.name === 'Sharda (WBE)') {
      recommendation = `*🚀 Best Overall: Sharda (WBE Partnership)*\n*💎 Premium Education + Maximum Savings*`
    } else if (bestOption.name === 'Chandigarh') {
      recommendation = `*🎓 Best Value: Chandigarh University*\n*🌟 Quality Education at Great Price*`
    } else if (bestOption.name === 'Galgotias') {
      recommendation = `*🎓 Best Value: Galgotias University*\n*🌟 Excellent Education with Great Scholarships*`
    } else {
      recommendation = `*🎓 Recommended: ${bestOption.name}*\n*⭐ Best Fit for Your Profile*`
    }

    let text = `${studentNameText}*📊 University Comparison*

${recommendation}

─────────────────────
*💰 COST COMPARISON*
─────────────────────
`

    if (comparisonData.niu) {
      text += `\n*🇮🇳 NIU*
*Program:* ${comparisonData.niu.program.name}
*Total Cost:* ${formatCurrency(niuTotal)}
*Scholarship:* 50% Guaranteed
*Key Points:* Affordable, guaranteed scholarship, industry partnerships`

      if (bestOption.name === 'NIU') {
        text += `\n*✅ BEST VALUE - Recommended!*`
      }
      text += `\n`
    }

    if (comparisonData.sharda) {
      text += `*🇮🇳 Sharda*
*Program:* ${comparisonData.sharda.program.name}
*Total Cost:* ${formatCurrency(shardaTotal)}`
      
      if (bestWBEScholarship && wbeTotal < shardaTotal) {
        text += `\n*WBE Enhanced:* ${formatCurrency(wbeTotal)} *[Save ${formatCurrency(shardaTotal - wbeTotal)}]*`
      }
      
      text += `\n*Scholarship:* ${eligibleShardaScholarships.length > 0 ? `${eligibleShardaScholarships[0].percentage}%` : 'N/A'}`
      text += `\n*Key Points:* International campus, 95+ countries, premium facilities`

      if (bestOption.name === 'Sharda' || bestOption.name === 'Sharda (WBE)') {
        text += `\n*✅ PREMIUM CHOICE - Recommended!*`
      }
      text += `\n`
    }

    if (comparisonData.chandigarh) {
      text += `*🇮🇳 Chandigarh*
*Program:* ${comparisonData.chandigarh.program.name}
*Total Cost:* ${formatCurrency(chandigarhTotal)}`
      text += `\n*Scholarship:* ${chandigarhTier ? `${chandigarhTier.percentage}%` : '35-50% (Based on GPA)'}`
      text += `\n*Key Points:* NAAC A+, Industry partnerships, Modern campus`

      if (bestOption.name === 'Chandigarh') {
        text += `\n*✅ GREAT VALUE - Recommended!*`
      }
      text += `\n`
    }

    if (comparisonData.galgotias) {
      text += `*🇮🇳 Galgotias*
*Program:* ${comparisonData.galgotias.program.name}
*Total Cost:* ${formatCurrency(galgotiasTotal)}`
      text += `\n*Scholarship:* ${galgotiasScholarship} (No GPA requirement)`
      text += `\n*Key Points:* NAAC A, NBA accredited, Industry partnerships, Modern campus`

      if (bestOption.name === 'Galgotias') {
        text += `\n*✅ EXCELLENT VALUE - Recommended!*`
      }
      text += `\n`
    }

    text += `─────────────────────
*🎁 FREE WBE Services*
─────────────────────
✓ FREE Visa Slot (Save 12K-20K BDT)
✓ FREE Documentation Support
✓ FREE Airport Reception
✓ FREE FRRO Registration
✓ FREE Accommodation Help
✓ FREE 24/7 Support

*💡 All services FREE! Others charge 15K-25K BDT.*

─────────────────────
*📞 Next Steps*
─────────────────────
Ready to proceed? Contact us for application process!

Best regards,
*WBE Education Consultancy*`

    try {
      await navigator.clipboard.writeText(text)
      alert('✅ Comparison copied! Ready for WhatsApp.')
    } catch (err) {
      alert('❌ Failed to copy. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            University Fee Comparison Tool
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">
            For WBE Counselors - Compare NIU, Sharda, Chandigarh & Galgotias Programs
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
            Reference Tool - All scholarship tiers displayed for transparency
          </p>
        </div>

        {/* Hierarchical Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h2 className="text-lg sm:text-xl font-semibold">Program Filters</h2>
              {activeFilterCount > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                  {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                </span>
              )}
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors flex items-center gap-2 self-start sm:self-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear All Filters
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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
          <div className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2 text-xs sm:text-sm">
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
                      <span className="ml-2 sm:ml-3 text-xs sm:text-sm">
                        → {niuPrograms.length + shardaPrograms.length + chandigarhPrograms.length + galgotiasPrograms.length} programs found 
                        ({niuPrograms.length} NIU, {shardaPrograms.length} Sharda, {chandigarhPrograms.length} Chandigarh, {galgotiasPrograms.length} Galgotias)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Student Information - Mobile Optimized */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
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

        {/* Program Selection - Four Universities */}
        <div className={`grid gap-3 sm:gap-4 mb-4 sm:mb-6 ${
          (niuPrograms.length > 0 ? 1 : 0) + (shardaPrograms.length > 0 ? 1 : 0) + (chandigarhPrograms.length > 0 ? 1 : 0) + (galgotiasPrograms.length > 0 ? 1 : 0) === 1 
            ? 'grid-cols-1' 
            : (niuPrograms.length > 0 ? 1 : 0) + (shardaPrograms.length > 0 ? 1 : 0) + (chandigarhPrograms.length > 0 ? 1 : 0) + (galgotiasPrograms.length > 0 ? 1 : 0) === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : (niuPrograms.length > 0 ? 1 : 0) + (shardaPrograms.length > 0 ? 1 : 0) + (chandigarhPrograms.length > 0 ? 1 : 0) + (galgotiasPrograms.length > 0 ? 1 : 0) === 3
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        }`}>
          {/* NIU Programs */}
          {niuPrograms.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
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
          )}

          {/* Sharda Programs */}
          {shardaPrograms.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
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
          )}

          {/* Chandigarh Programs */}
          {chandigarhPrograms.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
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
          )}

          {/* Galgotias Programs */}
          {galgotiasPrograms.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Galgotias Programs ({galgotiasPrograms.length})
              </h2>
              <span className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                60%/50%
              </span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {galgotiasPrograms.map(program => (
                <button
                  key={program.id}
                  onClick={() => handleProgramSelection(program, 'galgotias')}
                  className={`w-full text-left p-3 border rounded-lg transition-colors ${
                    selectedGalgotiasProgram?.id === program.id
                      ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                      : 'border-gray-200 hover:border-orange-500 hover:bg-orange-50'
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
          )}
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
        {comparisonData && (comparisonData.niu || comparisonData.sharda || comparisonData.chandigarh || comparisonData.galgotias) && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {((comparisonData.niu && comparisonData.sharda) || (comparisonData.niu && comparisonData.chandigarh) || (comparisonData.niu && comparisonData.galgotias) || (comparisonData.sharda && comparisonData.chandigarh) || (comparisonData.sharda && comparisonData.galgotias) || (comparisonData.chandigarh && comparisonData.galgotias) || (comparisonData.niu && comparisonData.sharda && comparisonData.chandigarh) || (comparisonData.niu && comparisonData.sharda && comparisonData.galgotias) || (comparisonData.niu && comparisonData.chandigarh && comparisonData.galgotias) || (comparisonData.sharda && comparisonData.chandigarh && comparisonData.galgotias) || (comparisonData.niu && comparisonData.sharda && comparisonData.chandigarh && comparisonData.galgotias)) ? 'Detailed Comparison' : 'Program Details'}
              </h2>
              {/* Smart Comparison Button */}
              {((comparisonData.niu && comparisonData.sharda) || (comparisonData.niu && comparisonData.chandigarh) || (comparisonData.niu && comparisonData.galgotias) || (comparisonData.sharda && comparisonData.chandigarh) || (comparisonData.sharda && comparisonData.galgotias) || (comparisonData.chandigarh && comparisonData.galgotias) || (comparisonData.niu && comparisonData.sharda && comparisonData.chandigarh) || (comparisonData.niu && comparisonData.sharda && comparisonData.galgotias) || (comparisonData.niu && comparisonData.chandigarh && comparisonData.galgotias) || (comparisonData.sharda && comparisonData.chandigarh && comparisonData.galgotias) || (comparisonData.niu && comparisonData.sharda && comparisonData.chandigarh && comparisonData.galgotias)) && (
                  <button
                    onClick={copySmartComparison}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-xl font-semibold transform hover:scale-105 text-sm sm:text-base w-full sm:w-auto justify-center"
                  title="Copy comprehensive comparison message for students (WhatsApp ready)"
                  >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  📊 Smart Comparison
                  </button>
                )}
            </div>

            <div className={`grid grid-cols-1 ${
              (comparisonData.niu && comparisonData.sharda && comparisonData.chandigarh && comparisonData.galgotias) ? 'md:grid-cols-2 lg:grid-cols-4' :
              ((comparisonData.niu && comparisonData.sharda && comparisonData.chandigarh) || (comparisonData.niu && comparisonData.sharda && comparisonData.galgotias) || (comparisonData.niu && comparisonData.chandigarh && comparisonData.galgotias) || (comparisonData.sharda && comparisonData.chandigarh && comparisonData.galgotias)) ? 'md:grid-cols-2 lg:grid-cols-3' : 
              ((comparisonData.niu && comparisonData.sharda) || (comparisonData.niu && comparisonData.chandigarh) || (comparisonData.niu && comparisonData.galgotias) || (comparisonData.sharda && comparisonData.chandigarh) || (comparisonData.sharda && comparisonData.galgotias) || (comparisonData.chandigarh && comparisonData.galgotias)) ? 'md:grid-cols-2' : ''
            } gap-3 sm:gap-4 lg:gap-6`}>
              {/* NIU Details */}
              {comparisonData.niu && (
                <div className="border-2 border-green-200 rounded-lg p-4 sm:p-6 bg-green-50">
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
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900">No Scholarship</h5>
                      <button
                        onClick={() => copyNIUDetails(0)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="Copy fee breakdown to clipboard"
                      >
                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
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
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-green-900">
                      After 50% Scholarship (All BD Students)
                    </h5>
                      <button
                        onClick={() => copyNIUDetails(50)}
                        className="p-1.5 hover:bg-green-200 rounded transition-colors"
                        title="Copy fee breakdown to clipboard"
                      >
                        <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-2">
                    {comparisonData.niu.calculations.flat.yearlyFees.map((fee, index) => (
                        <div key={index} className="flex justify-between text-sm">
                        <span>Year {index + 1}:</span>
                          <div className="text-right">
                            <span className="line-through text-gray-500 mr-2">
                              {formatCurrency(comparisonData.niu.program.annualFees[index])}
                            </span>
                            <span className="font-medium text-green-900">{formatCurrency(fee)}</span>
                          </div>
                      </div>
                    ))}
                      <div className="flex justify-between text-sm pt-2 border-t border-green-300">
              <span>One-Time Fee:</span>
                        <span className="font-medium text-green-900">{formatCurrency(comparisonData.niu.calculations.oneTimeFee)}</span>
            </div>
                      <div className="flex justify-between font-bold pt-2 border-t border-green-300">
                      <span>Total After Scholarship:</span>
                        <span className="text-green-900">{formatCurrency(comparisonData.niu.calculations.flat.totalFees)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-700 mt-2">
                      <span>You Save:</span>
                      <span className="font-semibold">{formatCurrency(comparisonData.niu.calculations.flat.savings)}</span>
                      </div>
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
                <div className="border-2 border-blue-200 rounded-lg p-4 sm:p-6 bg-blue-50">
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
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900">No Scholarship</h5>
                      <button
                        onClick={() => copyShardaDetails(0)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="Copy fee breakdown to clipboard"
                      >
                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
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
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                            <svg className="w-5 h-5 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <h6 className="font-semibold text-orange-900">No Scholarships Available</h6>
                            </div>
                            <button
                              onClick={() => copyShardaDetails(0)}
                              className="p-1.5 hover:bg-orange-200 rounded transition-colors"
                              title="Copy fee breakdown to clipboard"
                            >
                              <svg className="w-4 h-4 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
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
                          <div key={index} className="bg-blue-100 border border-blue-200 rounded-lg p-4 mb-3 hover:bg-blue-200 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 flex-1">
                              <h6 className="font-semibold text-blue-900">{tier.name}</h6>
                              <span className="text-lg font-bold text-blue-900">{tier.percentage}%</span>
                              </div>
                              <button
                                onClick={() => copyShardaDetails(tier.percentage)}
                                className="p-1.5 hover:bg-blue-300 rounded transition-colors flex-shrink-0"
                                title="Copy fee breakdown to clipboard"
                              >
                                <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
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
                                  <span className="font-medium text-blue-900">{formatCurrency(comparisonData.sharda.calculations.additionalFees.wbeComprehensive)}</span>
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
                <div className="border-2 border-purple-200 rounded-lg p-4 sm:p-6 bg-purple-50">
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
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900">No Scholarship</h5>
                      <button
                        onClick={() => copyChandigarhDetails(0)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="Copy fee breakdown to clipboard"
                      >
                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
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
                      <span>Examination Fee (Annual):</span>
                      <span className="font-medium">₹5,000 per year</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Health Insurance (Annual):</span>
                      <span className="font-medium">₹3,000 per year</span>
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
                      <div key={index} className="bg-purple-100 border border-purple-200 rounded-lg p-4 mb-3 hover:bg-purple-200 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 flex-1">
                          <h6 className="font-semibold text-purple-900">{tier.name}</h6>
                          <span className="text-lg font-bold text-purple-900">{tier.percentage}%</span>
                          </div>
                          <button
                            onClick={() => copyChandigarhDetails(tier.percentage)}
                            className="p-1.5 hover:bg-purple-300 rounded transition-colors flex-shrink-0"
                            title="Copy fee breakdown to clipboard"
                          >
                            <svg className="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
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
                              <span>Examination Fee (Annual):</span>
                              <span className="font-medium text-purple-900">₹5,000 per year</span>
                            </div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Health Insurance (Annual):</span>
                              <span className="font-medium text-purple-900">₹3,000 per year</span>
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

              {/* Galgotias Details */}
              {comparisonData.galgotias && (
                <div className="border-2 border-orange-200 rounded-lg p-4 sm:p-6 bg-orange-50">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {comparisonData.galgotias.university.name}
                  </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {comparisonData.galgotias.program.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Duration: {comparisonData.galgotias.program.duration} years
                    </p>
                    </div>

                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-900">No Scholarship</h5>
                      <button
                        onClick={() => copyGalgotiasDetails(0)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="Copy fee breakdown to clipboard"
                      >
                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                  </div>
                    {comparisonData.galgotias.program.annualFees.map((fee, index) => (
                      <div key={index} className="flex justify-between text-sm mb-1">
                        <span>Year {index + 1}:</span>
                        <span className="font-medium">{formatCurrency(fee)}</span>
                          </div>
                    ))}
                    <div className="flex justify-between text-sm mb-1 pt-2 border-t">
                      <span>One-Time Fee:</span>
                      <span className="font-medium">{formatCurrency(comparisonData.galgotias.calculations.oneTimeFee)}</span>
                          </div>
                    {comparisonData.galgotias.program.hasIndustryFee && (
                    <div className="flex justify-between text-sm mb-1">
                        <span>Industry Fee (1st Year):</span>
                        <span className="font-medium">{formatCurrency(comparisonData.galgotias.program.industryFeeFirstYear)}</span>
                </div>
              )}
                    <div className="flex justify-between text-sm mb-1">
                      <span>Examination Fee (Annual):</span>
                      <span className="font-medium">₹20,000 per year</span>
                      </div>
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Total Original:</span>
                      <span>{formatCurrency(comparisonData.galgotias.calculations.originalTotal)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Scholarship Card */}
                    <div className="bg-orange-100 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1">
                          <h6 className="font-semibold text-orange-900">
                            {comparisonData.galgotias.program.degree === 'B.Tech'
                              ? '60% Scholarship (B.Tech)' 
                              : '50% Scholarship'}
                          </h6>
                          <span className="text-lg font-bold text-orange-900">{comparisonData.galgotias.calculations.flat.percentage}%</span>
                        </div>
                        <button
                          onClick={() => copyGalgotiasDetails(comparisonData.galgotias.calculations.flat.percentage)}
                          className="p-1.5 hover:bg-orange-300 rounded transition-colors flex-shrink-0"
                          title="Copy fee breakdown to clipboard"
                        >
                          <svg className="w-4 h-4 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-orange-700 mb-3">
                        No GPA requirement - Guaranteed for all Bangladeshi students!
                      </p>
                      
                      {/* Year-by-year breakdown */}
                      <div className="bg-white rounded-lg p-3 mb-3">
                        <h7 className="text-xs font-semibold text-orange-900 mb-2 block">Yearly Fees After {comparisonData.galgotias.calculations.flat.percentage}% Scholarship:</h7>
                        {comparisonData.galgotias.calculations.flat.yearlyFees.map((fee, yearIndex) => (
                          <div key={yearIndex} className="flex justify-between text-xs mb-1">
                            <span>Year {yearIndex + 1}:</span>
                            <div className="text-right">
                              <span className="line-through text-gray-500 mr-2">
                                {formatCurrency(comparisonData.galgotias.program.annualFees[yearIndex])}
                              </span>
                              <span className="font-medium text-orange-900">{formatCurrency(fee)}</span>
                            </div>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-orange-200">
                          <div className="flex justify-between text-xs mb-1">
                            <span>One-Time Fee (Year 1):</span>
                            <span className="font-medium text-orange-900">{formatCurrency(comparisonData.galgotias.calculations.oneTimeFee)}</span>
                          </div>
                          {comparisonData.galgotias.program.hasIndustryFee && (
                            <div className="flex justify-between text-xs mb-1">
                              <span>Industry Fee (1st Year):</span>
                              <span className="font-medium text-orange-900">{formatCurrency(comparisonData.galgotias.program.industryFeeFirstYear)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-xs mb-1">
                            <span>Examination Fee (Annual):</span>
                            <span className="font-medium text-orange-900">₹20,000 per year</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center bg-orange-50 rounded-lg p-2">
                          <span className="font-medium">Total After Scholarship:</span>
                          <span className="font-bold text-orange-900">{formatCurrency(comparisonData.galgotias.calculations.flat.totalFees)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-green-50 rounded-lg p-2">
                          <span className="font-medium text-green-700">You Save:</span>
                          <span className="font-bold text-green-700">{formatCurrency(comparisonData.galgotias.calculations.flat.savings)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-2">Program Highlights</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {comparisonData.galgotias.program.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-orange-600 mr-2">✓</span>
                          {highlight}
                        </li>
                      ))}
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
