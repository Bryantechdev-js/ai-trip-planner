'use client'

import React, { useState } from 'react'
import { Phone, Check, AlertCircle } from 'lucide-react'

interface MobileMoneyInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export const MobileMoneyInput: React.FC<MobileMoneyInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter mobile number',
  className = '',
}) => {
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [network, setNetwork] = useState<'MTN' | 'Orange' | null>(null)

  const validatePhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace(/\s+/g, '')
    const phoneRegex = /^(237)?[67]\d{8}$/

    if (!cleanPhone) {
      setIsValid(null)
      setNetwork(null)
      return
    }

    const isValidFormat = phoneRegex.test(cleanPhone)
    setIsValid(isValidFormat)

    if (isValidFormat) {
      const phoneDigits = cleanPhone.replace(/\D/g, '')
      const prefix = phoneDigits.startsWith('237')
        ? phoneDigits.substring(3, 5)
        : phoneDigits.substring(0, 2)

      // MTN prefixes: 67, 68, 65, 66
      if (['67', '68', '65', '66'].includes(prefix)) {
        setNetwork('MTN')
      }
      // Orange prefixes: 69, 77, 78, 79
      else if (['69', '77', '78', '79'].includes(prefix)) {
        setNetwork('Orange')
      } else {
        setNetwork(null)
      }
    } else {
      setNetwork(null)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    validatePhoneNumber(newValue)
  }

  const formatPhoneNumber = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length <= 3) return cleanPhone
    if (cleanPhone.length <= 6) return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3)}`
    if (cleanPhone.length <= 9)
      return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`
    return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6, 9)} ${cleanPhone.slice(9)}`
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Phone className="h-5 w-5 text-gray-400" />
        </div>

        <input
          type="tel"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`block w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
            isValid === null
              ? 'border-gray-300'
              : isValid
                ? 'border-green-500 bg-green-50'
                : 'border-red-500 bg-red-50'
          }`}
        />

        {isValid !== null && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {isValid ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        )}
      </div>

      {/* Network indicator */}
      {network && (
        <div className="mt-2 flex items-center gap-2">
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              network === 'MTN' ? 'bg-yellow-100 text-yellow-800' : 'bg-orange-100 text-orange-800'
            }`}
          >
            {network} Mobile Money
          </div>
        </div>
      )}

      {/* Validation message */}
      {isValid === false && (
        <p className="mt-2 text-sm text-red-600">
          Please enter a valid Cameroon mobile number (e.g., 237XXXXXXXXX)
        </p>
      )}

      {/* Format hint */}
      {!value && (
        <p className="mt-2 text-sm text-gray-500">Format: 237XXXXXXXXX or XXXXXXXXX (MTN/Orange)</p>
      )}
    </div>
  )
}
