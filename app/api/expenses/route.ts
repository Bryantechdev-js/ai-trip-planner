import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { action, ...data } = await req.json()

    switch (action) {
      case 'add':
        return addExpense(data)
      case 'get':
        return getExpenses(data)
      case 'update':
        return updateExpense(data)
      case 'delete':
        return deleteExpense(data)
      case 'getBudgetAnalysis':
        return getBudgetAnalysis(data)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Expenses API Error:', error)
    return NextResponse.json({ error: 'Failed to process expense request' }, { status: 500 })
  }
}

async function addExpense(data: any) {
  // In a real app, this would save to a database
  // For now, we'll return a success response with the expense data
  const expense = {
    id: Date.now().toString(),
    ...data,
    createdAt: new Date().toISOString(),
  }

  return NextResponse.json({ success: true, expense })
}

async function getExpenses(data: any) {
  // Mock expense data - in production, fetch from database
  const mockExpenses = [
    {
      id: '1',
      tripId: data.tripId,
      category: 'Transportation',
      amount: 150,
      currency: 'XAF',
      description: 'Flight tickets',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      tripId: data.tripId,
      category: 'Accommodation',
      amount: 80,
      currency: 'USD',
      description: 'Hotel booking',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      tripId: data.tripId,
      category: 'Food',
      amount: 45,
      currency: 'USD',
      description: 'Local restaurant',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ]

  return NextResponse.json({ expenses: mockExpenses })
}

async function updateExpense(data: any) {
  // Mock update - in production, update in database
  return NextResponse.json({ success: true, expense: data })
}

async function deleteExpense(data: any) {
  // Mock delete - in production, delete from database
  return NextResponse.json({ success: true, deletedId: data.expenseId })
}

async function getBudgetAnalysis(data: any) {
  // Mock budget analysis
  const analysis = {
    totalBudget: data.budget || 1000,
    totalSpent: 275,
    remaining: 725,
    categories: {
      Transportation: { spent: 150, budget: 400, percentage: 37.5 },
      Accommodation: { spent: 80, budget: 300, percentage: 26.7 },
      Food: { spent: 45, budget: 200, percentage: 22.5 },
      Activities: { spent: 0, budget: 100, percentage: 0 },
    },
    recommendations: [
      "You're on track with your budget!",
      'Consider booking activities in advance for better deals',
      'Food expenses are well within budget',
    ],
  }

  return NextResponse.json(analysis)
}
