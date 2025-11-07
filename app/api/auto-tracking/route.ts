import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, data } = await req.json()

    if (action === 'scan-receipt') {
      const { image, tripId } = data

      // Mock OCR processing - in production, use OCR service
      const extractedData = await processReceiptOCR(image)

      const expense = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        tripId,
        amount: extractedData.amount,
        currency: extractedData.currency || 'USD',
        category: extractedData.category,
        merchant: extractedData.merchant,
        date: extractedData.date || new Date().toISOString(),
        description: extractedData.description,
        receiptImage: image,
        autoDetected: true,
        timestamp: new Date().toISOString(),
      }

      return NextResponse.json({
        success: true,
        expense,
        message: 'Receipt processed successfully',
      })
    }

    if (action === 'auto-categorize') {
      const { expenses } = data

      const categorizedExpenses = expenses.map((expense: any) => ({
        ...expense,
        category: categorizeMerchant(expense.merchant || expense.description),
        tags: generateTags(expense.description),
      }))

      return NextResponse.json({
        success: true,
        expenses: categorizedExpenses,
      })
    }

    if (action === 'budget-alert') {
      const { tripId, currentSpending, budget } = data

      const spendingPercentage = (currentSpending / budget) * 100
      let alertLevel = 'none'
      let message = ''

      if (spendingPercentage >= 90) {
        alertLevel = 'critical'
        message = `🚨 Budget Alert: You've spent ${spendingPercentage.toFixed(1)}% of your budget!`
      } else if (spendingPercentage >= 75) {
        alertLevel = 'warning'
        message = `⚠️ Budget Warning: You've spent ${spendingPercentage.toFixed(1)}% of your budget.`
      } else if (spendingPercentage >= 50) {
        alertLevel = 'info'
        message = `💡 Budget Update: You've spent ${spendingPercentage.toFixed(1)}% of your budget.`
      }

      if (alertLevel !== 'none') {
        // Send notification
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            type: 'budget_alert',
            title: 'Budget Alert',
            message,
            level: alertLevel,
            tripId,
          }),
        })
      }

      return NextResponse.json({
        success: true,
        alertLevel,
        message,
        spendingPercentage,
        recommendations: generateBudgetRecommendations(
          spendingPercentage,
          budget - currentSpending
        ),
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Auto-tracking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function processReceiptOCR(imageData: string) {
  // Mock OCR processing - in production, integrate with OCR service like Tesseract or AWS Textract
  const mockResults = [
    {
      amount: 25.5,
      currency: 'USD',
      merchant: 'Starbucks Coffee',
      category: 'Food & Drink',
      date: new Date().toISOString(),
      description: 'Coffee and pastry',
    },
    {
      amount: 45.0,
      currency: 'USD',
      merchant: 'Uber',
      category: 'Transportation',
      date: new Date().toISOString(),
      description: 'Ride to airport',
    },
    {
      amount: 120.0,
      currency: 'USD',
      merchant: 'Hotel Paradise',
      category: 'Accommodation',
      date: new Date().toISOString(),
      description: 'Hotel room - 1 night',
    },
  ]

  // Return random mock result
  return mockResults[Math.floor(Math.random() * mockResults.length)]
}

function categorizeMerchant(merchantName: string): string {
  const categories = {
    food: ['restaurant', 'cafe', 'starbucks', 'mcdonalds', 'pizza', 'food'],
    transportation: ['uber', 'lyft', 'taxi', 'bus', 'train', 'airline', 'gas'],
    accommodation: ['hotel', 'airbnb', 'hostel', 'resort', 'motel'],
    entertainment: ['cinema', 'theater', 'museum', 'park', 'tour', 'ticket'],
    shopping: ['mall', 'store', 'shop', 'market', 'souvenir'],
    health: ['pharmacy', 'hospital', 'clinic', 'medical'],
  }

  const lowerMerchant = merchantName.toLowerCase()

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerMerchant.includes(keyword))) {
      return category.charAt(0).toUpperCase() + category.slice(1)
    }
  }

  return 'Other'
}

function generateTags(description: string): string[] {
  const commonTags = ['business', 'personal', 'essential', 'luxury', 'group', 'solo']
  return commonTags.filter(() => Math.random() > 0.7).slice(0, 2)
}

function generateBudgetRecommendations(spendingPercentage: number, remaining: number): string[] {
  const recommendations = []

  if (spendingPercentage > 80) {
    recommendations.push('Consider reducing discretionary spending')
    recommendations.push('Look for free activities and attractions')
    recommendations.push('Cook meals instead of dining out')
  } else if (spendingPercentage > 60) {
    recommendations.push('Monitor daily spending more closely')
    recommendations.push('Set daily spending limits')
  } else {
    recommendations.push("You're on track with your budget!")
    recommendations.push('Consider setting aside some funds for unexpected expenses')
  }

  if (remaining > 0) {
    recommendations.push(`You have $${remaining.toFixed(2)} remaining in your budget`)
  }

  return recommendations
}
