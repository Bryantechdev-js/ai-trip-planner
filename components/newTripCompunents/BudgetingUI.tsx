'use client'

import React, { useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface BudgetingUIProps {
  onBudgetSelect?: (budget: string, label: string) => void;
}

const BudgetingUI = ({ onBudgetSelect }: BudgetingUIProps) => {
  const [selectedBudget, setSelectedBudget] = useState<string>('')
  
  const handleBudgetSelect = (budgetId: string, label: string) => {
    setSelectedBudget(budgetId);
    if (onBudgetSelect) {
      setTimeout(() => onBudgetSelect(budgetId, label), 500);
    }
  };

  const budgetOptions = [
    {
      id: 'low',
      label: 'Budget Friendly',
      range: '$500 - $1,500',
      icon: <TrendingDown className="w-5 h-5" />,
      description: 'Hostels, local transport, street food',
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      id: 'medium',
      label: 'Moderate',
      range: '$1,500 - $5,000',
      icon: <Minus className="w-5 h-5" />,
      description: '3-star hotels, mix of transport, good restaurants',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    {
      id: 'high',
      label: 'Luxury',
      range: '$5,000+',
      icon: <TrendingUp className="w-5 h-5" />,
      description: '5-star hotels, private transport, fine dining',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    }
  ]

  return (
    <div className="w-full max-w-2xl bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Select Your Budget</h3>
          <p className="text-sm text-gray-600">Choose a budget range that works for you</p>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {budgetOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => handleBudgetSelect(option.id, option.label)}
            className={`p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
              selectedBudget === option.id
                ? 'border-primary bg-primary/5 shadow-md'
                : option.color
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                selectedBudget === option.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {option.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                  <h4 className="font-semibold text-gray-800 text-base sm:text-lg">{option.label}</h4>
                  <span className="text-primary font-bold text-sm sm:text-base">{option.range}</span>
                </div>
                <p className="text-gray-600 text-sm mt-1">{option.description}</p>
              </div>
              
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedBudget === option.id
                  ? 'border-primary bg-primary'
                  : 'border-gray-300'
              }`}>
                {selectedBudget === option.id && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedBudget && (
        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-primary font-medium">
            ✓ Great choice! I'll find options within your {budgetOptions.find(opt => opt.id === selectedBudget)?.label.toLowerCase()} budget range.
          </p>
        </div>
      )}
    </div>
  )
}

export default BudgetingUI