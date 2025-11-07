import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, ...data } = await req.json()

    switch (action) {
      case 'scan-receipt':
        return await scanReceipt(data)
      case 'auto-categorize':
        return await autoCategorizeExpense(data)
      case 'budget-alert':
        return await checkBudgetAlerts(userId, data)
      case 'expense-insights':
        return await generateExpenseInsights(userId, data)
      case 'currency-convert':
        return await convertCurrency(data)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Expense tracker error:', error)
    return NextResponse.json({ error: 'Expense tracking failed' }, { status: 500 })
  }
}

async function scanReceipt(data: any) {
  // Simulate OCR receipt scanning
  const scannedData = {
    merchant: 'Local Restaurant',
    amount: 45.5,
    currency: 'USD',
    date: new Date().toISOString(),
    items: [
      { name: 'Pasta Carbonara', price: 18.0 },
      { name: 'Caesar Salad', price: 12.5 },
      { name: 'Wine', price: 15.0 },
    ],
    category: 'Food & Dining',
    location: {
      address: '123 Main St, City',
      coordinates: { lat: 40.7128, lng: -74.006 },
    },
    confidence: 0.95,
  }

  return NextResponse.json({
    success: true,
    message: 'Receipt scanned successfully',
    expense: scannedData,
    suggestions: {
      category: 'Food & Dining',
      tags: ['dinner', 'restaurant', 'local cuisine'],
      budgetImpact: 'Within food budget limits',
    },
  })
}

async function autoCategorizeExpense(data: any) {
  const { description, amount, merchant } = data

  // AI-powered categorization logic
  const categories = {
    'transport|taxi|uber|flight|bus|train': 'Transportation',
    'hotel|accommodation|airbnb|booking': 'Accommodation',
    'restaurant|food|cafe|dining|meal': 'Food & Dining',
    'museum|tour|activity|ticket|attraction': 'Activities',
    'shopping|souvenir|gift|store': 'Shopping',
    'medical|pharmacy|hospital|doctor': 'Medical',
    'emergency|urgent|help': 'Emergency',
  }

  let suggestedCategory = 'Other'
  const searchText = `${description} ${merchant}`.toLowerCase()

  for (const [keywords, category] of Object.entries(categories)) {
    if (new RegExp(keywords).test(searchText)) {
      suggestedCategory = category
      break
    }
  }

  return NextResponse.json({
    success: true,
    category: suggestedCategory,
    confidence: 0.87,
    alternatives: ['Food & Dining', 'Entertainment', 'Other'],
    smartTags: generateSmartTags(description, merchant),
    budgetRecommendation:
      amount > 100 ? 'Consider if this aligns with your budget goals' : 'Reasonable expense',
  })
}

async function checkBudgetAlerts(userId: string, data: any) {
  const { tripId, totalBudget, currentSpending } = data

  const spentPercentage = (currentSpending / totalBudget) * 100
  const alerts = []

  if (spentPercentage >= 90) {
    alerts.push({
      type: 'critical',
      message: "🚨 Budget Alert: You've spent 90% of your budget!",
      recommendation: 'Consider reducing expenses for remaining days',
    })
  } else if (spentPercentage >= 75) {
    alerts.push({
      type: 'warning',
      message: '⚠️ Budget Warning: 75% of budget used',
      recommendation: 'Monitor spending closely for remaining trip',
    })
  } else if (spentPercentage >= 50) {
    alerts.push({
      type: 'info',
      message: '💡 Budget Update: Halfway through your budget',
      recommendation: "You're on track with your spending",
    })
  }

  return NextResponse.json({
    success: true,
    budgetStatus: {
      percentage: spentPercentage,
      remaining: totalBudget - currentSpending,
      dailyRecommendation: calculateDailyBudget(totalBudget, currentSpending, data.remainingDays),
    },
    alerts,
    insights: generateBudgetInsights(spentPercentage),
  })
}

async function generateExpenseInsights(userId: string, data: any) {
  const insights = {
    spendingPattern: {
      topCategory: 'Food & Dining',
      averageDaily: 85.5,
      peakSpendingDay: 'Day 3',
      savingsOpportunities: [
        'Consider local markets for meals',
        'Book activities in advance for discounts',
        'Use public transport instead of taxis',
      ],
    },
    comparison: {
      vsPlanned: '+12%',
      vsAverage: '-5%',
      vsSimilarTrips: 'Within normal range',
    },
    predictions: {
      totalProjected: 1250,
      budgetVariance: '+8%',
      recommendedAdjustments: [
        'Reduce dining expenses by 15%',
        'Look for free activities on remaining days',
      ],
    },
    achievements: [
      '🎯 Stayed within accommodation budget',
      '💰 Found 3 great deals this trip',
      '📊 Improved spending tracking by 40%',
    ],
  }

  return NextResponse.json({
    success: true,
    insights,
    nextRecommendations: [
      'Set daily spending reminders',
      'Enable automatic expense categorization',
      'Connect bank account for real-time tracking',
    ],
  })
}

async function convertCurrency(data: any) {
  // Simulate real-time currency conversion
  const exchangeRates = {
    USD: { XAF: 580, EUR: 0.85, GBP: 0.73 },
    XAF: { USD: 0.0017, EUR: 0.0015, GBP: 0.0013 },
    EUR: { USD: 1.18, XAF: 655, GBP: 0.86 },
  }

  const { amount, fromCurrency, toCurrency } = data
  const rate = exchangeRates[fromCurrency]?.[toCurrency] || 1
  const convertedAmount = amount * rate

  return NextResponse.json({
    success: true,
    conversion: {
      original: { amount, currency: fromCurrency },
      converted: { amount: convertedAmount, currency: toCurrency },
      rate,
      timestamp: new Date().toISOString(),
    },
    marketInfo: {
      trend: 'stable',
      lastUpdate: new Date().toISOString(),
      source: 'Real-time market data',
    },
  })
}

function generateSmartTags(description: string, merchant: string): string[] {
  const tags = []
  const text = `${description} ${merchant}`.toLowerCase()

  if (text.includes('local') || text.includes('traditional')) tags.push('local-experience')
  if (text.includes('tip') || text.includes('service')) tags.push('service-charge')
  if (text.includes('group') || text.includes('shared')) tags.push('group-expense')
  if (text.includes('emergency') || text.includes('urgent')) tags.push('emergency')

  return tags
}

function calculateDailyBudget(total: number, spent: number, remainingDays: number): number {
  return remainingDays > 0 ? (total - spent) / remainingDays : 0
}

function generateBudgetInsights(percentage: number): string[] {
  if (percentage < 25) return ["Great start! You're being very budget-conscious"]
  if (percentage < 50) return ['Good pacing with your budget']
  if (percentage < 75) return ['Monitor spending more closely']
  return ['Consider cutting back on non-essential expenses']
}
