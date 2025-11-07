'use client'

import React from 'react'
import { CheckCircle, Clock, AlertCircle, Loader, Phone, CreditCard } from 'lucide-react'

interface PaymentStatusIndicatorProps {
  status: 'idle' | 'processing' | 'ussd_sent' | 'awaiting_payment' | 'completed' | 'failed'
  paymentMethod: 'momo' | 'card'
  message?: string
  timeRemaining?: number
}

export const PaymentStatusIndicator: React.FC<PaymentStatusIndicatorProps> = ({
  status,
  paymentMethod,
  message,
  timeRemaining
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'processing':
        return {
          icon: <Loader className="w-5 h-5 animate-spin" />,
          color: 'bg-blue-50 border-blue-200 text-blue-800',
          title: 'Processing Payment',
          description: 'Initiating payment request...'
        }
      case 'ussd_sent':
        return {
          icon: <Phone className="w-5 h-5 animate-pulse" />,
          color: 'bg-orange-50 border-orange-200 text-orange-800',
          title: 'USSD Code Sent',
          description: 'Dial *126# (Orange) or *150# (MTN) to complete payment'
        }
      case 'awaiting_payment':
        return {
          icon: <Clock className="w-5 h-5" />,
          color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          title: 'Awaiting Payment',
          description: 'Complete payment on your device'
        }
      case 'completed':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          color: 'bg-green-50 border-green-200 text-green-800',
          title: 'Payment Successful',
          description: 'Subscription activated successfully'
        }
      case 'failed':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          color: 'bg-red-50 border-red-200 text-red-800',
          title: 'Payment Failed',
          description: 'Transaction was not completed'
        }
      default:
        return null
    }
  }

  const config = getStatusConfig()
  if (!config) return null

  return (
    <div className={`p-4 rounded-lg border ${config.color} transition-all duration-300`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm">{config.title}</h4>
            {paymentMethod === 'momo' && (
              <span className="text-xs px-2 py-0.5 bg-white/50 rounded-full">
                Mobile Money
              </span>
            )}
          </div>
          <p className="text-sm opacity-90">{message || config.description}</p>
          
          {status === 'ussd_sent' && (
            <div className="mt-2 p-2 bg-white/30 rounded text-xs">
              <strong>Next steps:</strong>
              <ol className="list-decimal list-inside mt-1 space-y-0.5">
                <li>Check your phone for USSD notification</li>
                <li>Dial *126# (Orange) or *150# (MTN)</li>
                <li>Follow prompts to complete payment</li>
                <li>Payment will be confirmed automatically</li>
              </ol>
            </div>
          )}
          
          {status === 'awaiting_payment' && timeRemaining && (
            <div className="mt-2 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span>Time remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>
          )}
          
          {status === 'processing' && (
            <div className="mt-2">
              <div className="w-full bg-white/30 rounded-full h-1.5">
                <div className="bg-current h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}