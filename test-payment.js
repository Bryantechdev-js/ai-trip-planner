// Test script for Lygos API integration
// Run with: node test-payment.js

const testLygosPayment = async () => {
  const testPayload = {
    amount: 5000,
    shop_name: 'AI Trip Planner',
    message: 'pro subscription - AI Trip Planner',
    success_url:
      'http://localhost:3000/api/payment/callback?status=success&orderId=test_123&userId=test_user&planId=pro',
    failure_url: 'http://localhost:3000/api/payment/callback?status=failed&orderId=test_123',
    order_id: 'trip_pro_test_user_' + Date.now(),
  }

  console.log('Testing Lygos API with payload:', testPayload)

  try {
    const response = await fetch('https://api.lygosapp.com/v1/gateway', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': 'lygosapp-ab1feb5f-f112-4fef-8d04-fc11a2bfcd16',
        Accept: 'application/json',
      },
      body: JSON.stringify(testPayload),
    })

    const result = await response.json()

    console.log('Response status:', response.status)
    console.log('Response body:', result)

    if (response.ok) {
      console.log('✅ Lygos API integration successful!')
      console.log('Payment URL:', result.payment_url || result.checkout_url)
      console.log('Transaction ID:', result.transaction_id || result.id)
    } else {
      console.log('❌ Lygos API error:', result)
    }
  } catch (error) {
    console.error('❌ Network error:', error.message)
  }
}

// Phone number validation test
const testPhoneValidation = () => {
  const testNumbers = [
    '237677123456', // Valid MTN
    '237699123456', // Valid MTN
    '237777123456', // Valid Orange
    '237692277282', // Valid Orange (test number)
    '677123456', // Valid MTN without country code
    '777123456', // Valid Orange without country code
    '692277282', // Valid Orange without country code (test number)
    '237123456789', // Invalid - wrong prefix
    '677123', // Invalid - too short
    '23767712345678', // Invalid - too long
  ]

  console.log('\n📱 Testing phone number validation:')

  testNumbers.forEach(number => {
    const phoneRegex = /^(237)?[67]\d{8}$/
    const cleanPhone = number.replace(/\s+/g, '')
    const isValid = phoneRegex.test(cleanPhone)

    let provider = null
    if (isValid) {
      const phoneWithoutCountryCode = cleanPhone.startsWith('237')
        ? cleanPhone.substring(3)
        : cleanPhone

      const prefix = phoneWithoutCountryCode.substring(0, 2)

      // MTN prefixes: 67, 68, 65, 66
      if (['67', '68', '65', '66'].includes(prefix)) {
        provider = 'MTN'
      }
      // Orange prefixes: 69, 77, 78, 79 and other 7x numbers
      else if (
        ['69', '77', '78', '79'].includes(prefix) ||
        phoneWithoutCountryCode.startsWith('7')
      ) {
        provider = 'Orange'
      }
      // Default for 6x numbers
      else if (phoneWithoutCountryCode.startsWith('6')) {
        provider = 'MTN'
      }
    }

    console.log(`${number}: ${isValid ? '✅' : '❌'} ${provider ? `(${provider})` : ''}`)
  })
}

// Run tests
console.log('🧪 Starting Lygos Payment Integration Tests\n')
testPhoneValidation()
console.log('\n🌐 Testing Lygos API connection...')
testLygosPayment()
