import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, data } = await req.json();

    switch (action) {
      case 'scan_receipt':
        return await scanReceipt(userId, data);
      case 'add_expense':
        return await addExpense(userId, data);
      case 'get_expenses':
        return await getExpenses(userId, data.tripId);
      case 'budget_alert':
        return await checkBudgetAlert(userId, data);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Expense tracker error:', error);
    return NextResponse.json({ error: "Expense tracking failed" }, { status: 500 });
  }
}

async function scanReceipt(userId: string, data: any) {
  const { imageData, tripId } = data;
  
  // Simulate OCR processing
  const extractedData = {
    merchant: "Sample Restaurant",
    amount: 45.99,
    currency: "USD",
    date: new Date().toISOString(),
    category: "Food & Dining",
    items: ["Dinner for 2", "Drinks"],
    confidence: 0.95
  };

  const expense = {
    id: `expense_${Date.now()}`,
    userId,
    tripId,
    ...extractedData,
    receiptImage: imageData,
    autoAdded: true,
    verified: false
  };

  return NextResponse.json({
    success: true,
    expense,
    autoCategories: ["Food & Dining", "Transportation", "Accommodation", "Activities"],
    budgetImpact: await calculateBudgetImpact(userId, tripId, extractedData.amount)
  });
}

async function addExpense(userId: string, data: any) {
  const { tripId, amount, category, description, currency = "USD" } = data;
  
  const expense = {
    id: `expense_${Date.now()}`,
    userId,
    tripId,
    amount,
    category,
    description,
    currency,
    date: new Date().toISOString(),
    autoAdded: false
  };

  const budgetStatus = await calculateBudgetImpact(userId, tripId, amount);
  
  return NextResponse.json({
    success: true,
    expense,
    budgetStatus,
    autoAlerts: budgetStatus.overBudget ? ["Budget exceeded", "Consider adjusting spending"] : []
  });
}

async function getExpenses(userId: string, tripId: string) {
  const expenses = [
    { id: "1", amount: 120, category: "Transportation", description: "Flight", date: new Date().toISOString() },
    { id: "2", amount: 45.99, category: "Food & Dining", description: "Dinner", date: new Date().toISOString() }
  ];

  const summary = {
    total: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    byCategory: expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>)
  };

  return NextResponse.json({ expenses, summary });
}

async function checkBudgetAlert(userId: string, data: any) {
  const { tripId, currentSpending, budget } = data;
  const percentage = (currentSpending / budget) * 100;
  
  return NextResponse.json({
    alert: percentage > 80,
    percentage,
    remaining: budget - currentSpending,
    recommendations: percentage > 80 ? ["Reduce dining expenses", "Use public transport"] : []
  });
}

async function calculateBudgetImpact(userId: string, tripId: string, amount: number) {
  const budget = 1000; // Mock budget
  const currentSpending = 300; // Mock current spending
  const newTotal = currentSpending + amount;
  
  return {
    budget,
    currentSpending: newTotal,
    remaining: budget - newTotal,
    percentage: (newTotal / budget) * 100,
    overBudget: newTotal > budget
  };
}