'use client'

import React, { useState } from 'react'
import { Users, User, Heart, UserPlus } from 'lucide-react'

interface GroupSizeUiProps {
  onGroupSelect?: (groupId: string, label: string) => void;
}

const GroupSizeUi = ({ onGroupSelect }: GroupSizeUiProps) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  
  const handleGroupSelect = (groupId: string, label: string) => {
    setSelectedGroup(groupId);
    if (onGroupSelect) {
      setTimeout(() => onGroupSelect(groupId, label), 500);
    }
  };

  const groupOptions = [
    {
      id: 'solo',
      label: 'Solo Travel',
      description: 'Just me, myself and I',
      icon: <User className="w-5 h-5" />,
      count: '1 person',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
    },
    {
      id: 'couple',
      label: 'Couple',
      description: 'Romantic getaway for two',
      icon: <Heart className="w-5 h-5" />,
      count: '2 people',
      color: 'bg-pink-50 border-pink-200 hover:bg-pink-100'
    },
    {
      id: 'family',
      label: 'Family',
      description: 'Fun trip with the family',
      icon: <Users className="w-5 h-5" />,
      count: '3-6 people',
      color: 'bg-green-50 border-green-200 hover:bg-green-100'
    },
    {
      id: 'friends',
      label: 'Friends',
      description: 'Adventure with the squad',
      icon: <UserPlus className="w-5 h-5" />,
      count: '4+ people',
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
    }
  ]

  return (
    <div className="w-full max-w-2xl bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Group Size</h3>
          <p className="text-sm text-gray-600">Who's joining you on this adventure?</p>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {groupOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => handleGroupSelect(option.id, option.label)}
            className={`p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
              selectedGroup === option.id
                ? 'border-primary bg-primary/5 shadow-md'
                : option.color
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                selectedGroup === option.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {option.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <h4 className="font-semibold text-gray-800 text-base sm:text-lg">{option.label}</h4>
                  <span className="text-primary font-medium text-sm">{option.count}</span>
                </div>
                <p className="text-gray-600 text-sm mt-1">{option.description}</p>
              </div>
              
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selectedGroup === option.id
                  ? 'border-primary bg-primary'
                  : 'border-gray-300'
              }`}>
                {selectedGroup === option.id && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedGroup && (
        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-primary font-medium">
            ✓ Perfect! I'll tailor recommendations for {groupOptions.find(opt => opt.id === selectedGroup)?.label.toLowerCase()} travel.
          </p>
        </div>
      )}
    </div>
  )
}

export default GroupSizeUi
