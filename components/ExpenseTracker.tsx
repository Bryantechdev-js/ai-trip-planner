'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Receipt,
  Edit,
  Trash2,
} from 'lucide-react'

interface Expense {
  id: string
  category: string
  amount: number
  currency: string
  description: string
  date: string
}

interface ExpenseTrackerProps {
  tripId?: string
  budget?: number
}

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ tripId = 'default', budget = 1000 }) => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgetAnalysis, setBudgetAnalysis] = useState<any>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newExpense, setNewExpense] = useState({
    category: 'Transportation',
    amount: '',
    description: '',
    currency: 'USD',
  })
  const [loading, setLoading] = useState(true)

  const categories = ['Transportation', 'Accommodation', 'Food', 'Activities', 'Shopping', 'Other']

  useEffect(() => {
    fetchExpenses()
    fetchBudgetAnalysis()
  }, [tripId])

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get', tripId }),
      })
      const data = await response.json()
      setExpenses(data.expenses || [])
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBudgetAnalysis = async () => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getBudgetAnalysis', tripId, budget }),
      })
      const data = await response.json()
      setBudgetAnalysis(data)
    } catch (error) {
      console.error('Error fetching budget analysis:', error)
    }
  }

  const addExpense = async () => {
    if (!newExpense.amount || !newExpense.description) return

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          tripId,
          ...newExpense,
          amount: parseFloat(newExpense.amount),
          date: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        fetchExpenses()
        fetchBudgetAnalysis()
        setNewExpense({ category: 'Transportation', amount: '', description: '', currency: 'USD' })
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Error adding expense:', error)
    }
  }

  const deleteExpense = async (expenseId: string) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', expenseId }),
      })

      if (response.ok) {
        fetchExpenses()
        fetchBudgetAnalysis()
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const remaining = budget - totalSpent
  const spentPercentage = (totalSpent / budget) * 100

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
        <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-800">
            <DollarSign className="w-5 h-5" />
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">${budget}</div>
              <div className="text-sm text-gray-600">Total Budget</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">${totalSpent}</div>
              <div className="text-sm text-gray-600">Spent</div>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                ${remaining}
              </div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Budget Progress</span>
              <span>{spentPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  spentPercentage > 90
                    ? 'bg-red-500'
                    : spentPercentage > 70
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {budgetAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(budgetAnalysis.categories).map(([category, data]: [string, any]) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{category}</span>
                      <span className="text-sm text-gray-600">
                        ${data.spent} / ${data.budget}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(data.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Expense Form */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Expenses
            </CardTitle>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newExpense.category}
                    onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <div className="flex">
                    <select
                      value={newExpense.currency}
                      onChange={e => setNewExpense({ ...newExpense, currency: e.target.value })}
                      className="p-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="XAF">XAF</option>
                    </select>
                    <input
                      type="number"
                      value={newExpense.amount}
                      onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                      placeholder="0.00"
                      className="flex-1 p-2 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="What did you spend on?"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addExpense} className="bg-primary hover:bg-primary/90">
                  Add Expense
                </Button>
                <Button onClick={() => setShowAddForm(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Expenses List */}
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No expenses recorded yet</p>
                <p className="text-sm">Add your first expense to start tracking</p>
              </div>
            ) : (
              expenses.map(expense => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{expense.description}</div>
                        <div className="text-sm text-gray-600">
                          {expense.category} • {new Date(expense.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold">
                        {expense.currency} {expense.amount}
                      </div>
                    </div>
                    <Button
                      onClick={() => deleteExpense(expense.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Budget Recommendations */}
      {budgetAnalysis?.recommendations && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TrendingUp className="w-5 h-5" />
              Smart Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {budgetAnalysis.recommendations.map((recommendation: string, index: number) => (
                <div key={index} className="flex items-start gap-2 text-green-700">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ExpenseTracker
